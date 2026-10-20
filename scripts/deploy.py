#!/usr/bin/env python3
"""Recoverable demo deployment. Only chain 99801; keys never enter a manifest."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
FOUNDRY = Path.home() / '.foundry' / 'bin'


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix='.deploy-')
    with os.fdopen(fd, 'w') as handle:
        json.dump(data, handle, indent=2)
        handle.write('\n')
    os.replace(tmp, path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--rpc', required=True)
    parser.add_argument('--network', choices=['local', 'testnet'], required=True)
    args = parser.parse_args()
    if args.network == 'testnet' and args.rpc != 'https://testnet-rpc.elysium.kinetiq.xyz':
        raise SystemExit('Testnet RPC must be the authorized Elysium endpoint.')
    if args.network == 'local' and urlparse(args.rpc).hostname not in ['localhost', '127.0.0.1']:
        raise SystemExit('Local deployment requires a loopback RPC.')
    key = dict(line.split('=', 1) for line in (ROOT / '.env').read_text().splitlines() if '=' in line)['PRIVATE_KEY']

    def run(tool, *arguments, signed=False):
        command = [str(FOUNDRY / tool), *map(str, arguments)]
        if signed:
            chain = run('cast', 'chain-id', '--rpc-url', args.rpc)
            if chain != '99801':
                raise SystemExit('Wrong chain ID: ' + chain)
            # --constructor-args consumes the rest of argv, so flags must precede it.
            command[2:2] = ['--private-key', key, '--chain', '99801']
        result = subprocess.run(command, cwd=ROOT / 'contracts', text=True, capture_output=True)
        if result.returncode:
            # Do not print a command containing the signing key.
            print((result.stdout + result.stderr).replace(key, '[REDACTED]'), end='')
            raise SystemExit(result.returncode)
        return result.stdout.strip()

    chain = run('cast', 'chain-id', '--rpc-url', args.rpc)
    if chain != '99801':
        raise SystemExit('Wrong chain ID: ' + chain)
    wallet = run('cast', 'wallet', 'address', '--private-key', key)
    if wallet.lower() != '0xae35d4dc0385c34055e0b54d2d855669106c5778':
        raise SystemExit('Signing wallet does not match the authorized throwaway wallet.')
    if int(run('cast', 'balance', wallet, '--rpc-url', args.rpc)) == 0:
        raise SystemExit('Wallet balance is 0 wei; deployment stopped.')
    path = ROOT / 'deployments' / f'{args.network}-99801.json'
    data = json.loads(path.read_text()) if path.exists() else {
        'chainId': 99801, 'rpc': args.rpc, 'source': 'mock-hook', 'wallet': wallet,
        'contracts': {}, 'transactions': {}, 'samples': [],
    }
    if data['rpc'] != args.rpc:
        raise SystemExit('Manifest RPC does not match; stopped.')

    def deploy(name, source, *constructor_args):
        if name in data['contracts']:
            code = run('cast', 'code', data['contracts'][name], '--rpc-url', args.rpc)
            if code == '0x':
                raise SystemExit('Existing deployment has no code: ' + name)
            return data['contracts'][name]
        print('Deploying ' + name, flush=True)
        arguments = ['create', source, '--rpc-url', args.rpc, '--broadcast']
        if constructor_args:
            arguments.extend(['--constructor-args', *constructor_args])
        output = run('forge', *arguments, signed=True)
        address = re.search(r'Deployed to:\s*(0x[0-9a-fA-F]{40})', output)
        transaction = re.search(r'Transaction hash:\s*(0x[0-9a-fA-F]{64})', output)
        if not address or not transaction:
            print(output)
            raise SystemExit('Deployment result missing address/hash; stop and inspect before any retry.')
        receipt = json.loads(run('cast', 'receipt', transaction[1], '--rpc-url', args.rpc, '--json'))
        if int(str(receipt['status']), 0) != 1:
            raise SystemExit('Deployment receipt failed: ' + json.dumps(receipt))
        data['contracts'][name] = address[1]
        data['transactions']['deploy:' + name] = transaction[1]
        data.setdefault('deploymentBlock', int(str(receipt['blockNumber']), 0))
        write_json(path, data)
        print(name + ': ' + address[1] + ' tx ' + transaction[1], flush=True)
        return address[1]

    def send(label, address, signature, *values):
        if label in data['transactions']:
            return
        print('Sending ' + label, flush=True)
        receipt = json.loads(run('cast', 'send', address, signature, *values, '--rpc-url', args.rpc, '--json', signed=True))
        if int(str(receipt['status']), 0) != 1:
            raise SystemExit('Transaction receipt failed: ' + json.dumps(receipt))
        data['transactions'][label] = receipt['transactionHash']
        write_json(path, data)
        print(label + ': ' + receipt['transactionHash'], flush=True)

    run('forge', 'build')
    vest_token = deploy('TestCoin', 'src/TestCoin.sol:TestCoin')
    hook = deploy('MockFeeHook', 'src/MockFeeHook.sol:MockFeeHook', wallet)
    registry = deploy('HorkosRegistry', 'src/HorkosRegistry.sol:HorkosRegistry', hook)
    send('set-registry', hook, 'setRegistry(address)', registry)
    deploy('HorkosLens', 'src/HorkosLens.sol:HorkosLens')
    burn_token = deploy('BurnTestCoin', 'src/TestCoin.sol:TestCoin')
    for token, mode, cliff, bps, title in [(vest_token, '0', '86400', '0', '30-day vesting oath'), (burn_token, '1', '0', '5000', '50% burn oath')]:
        send('register:' + token, hook, 'registerToken(address)', token)
        send('oath:' + token, registry, 'createOath(address,uint8,uint64,uint64,uint16)', token, mode, '2592000', cliff, bps)
        oath_id = int(run('cast', 'call', registry, 'oathForToken(address)(uint256)', token, '--rpc-url', args.rpc))
        oath = run('cast', 'call', registry, 'oaths(uint256)(address,address,address,uint256)', oath_id, '--rpc-url', args.rpc).splitlines()
        vault = oath[2].strip()
        if not any(sample['oathId'] == oath_id for sample in data['samples']):
            data['samples'].append({'oathId': oath_id, 'token': token, 'vault': vault, 'title': title, 'mode': 'vest' if mode == '0' else 'burn'})
            write_json(path, data)
        send('approve:' + token, token, 'approve(address,uint256)', hook, '1000000000000000000000')
        for trade in range(3):
            send('trade:' + token + ':' + str(trade), hook, 'simulateTrade(address,uint256)', token, '1000000000000000000000')
        if mode == '1':
            send('settle:' + token, vault, 'settle()')
        status = run('cast', 'call', registry, 'status(uint256)(uint8)', oath_id, '--rpc-url', args.rpc)
        if status != '0':
            raise SystemExit('Unexpected sample status: ' + status)
        print('Verified oath ' + str(oath_id) + ': Active, vault ' + vault, flush=True)
    write_json(path, data)
    if args.network == 'testnet':
        shutil.copyfile(path, ROOT / 'app' / 'lib' / 'deployment.json')
    print('Deployment and sample verification complete: ' + str(path))


if __name__ == '__main__':
    main()
