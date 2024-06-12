// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { readFileSync } from "fs";
import * as solc from "solc";

const source = readFileSync("./contracts/SimpleStorage.sol", 'utf8');


// Solidity compiler input format
const input = {
    language: 'Solidity',
    sources: {
        'SimpleStorage.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const loadCompiler = async (version: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion(version, (err: any, solcSnapshot: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(solcSnapshot);
            }
        });
    });
};


function findImports(importPath: string) {
    return { contents: readFileSync("./node_modules/" + importPath, 'utf8') }
}

async function GET(req: NextApiRequest, res: NextApiResponse) {

    const solcSnapshot = await loadCompiler('v0.8.20+commit.a1b79de6');
    const output = JSON.parse(solcSnapshot.compile(JSON.stringify(input), { import: findImports }));
    console.log(output)
    const contract = output.contracts['SimpleStorage.sol']["SimpleStorage"];
    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;


    return res.status(200).json({
        bytecode,abi
    })
}

async function POST(req: NextApiRequest, res: NextApiResponse) {

    const solcSnapshot = await loadCompiler('v0.8.20+commit.a1b79de6');
    const output = JSON.parse(solcSnapshot.compile(JSON.stringify(input)));

    const contract = output.contracts['SimpleStorage.sol']['SimpleStorage'];
    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;


    return res.status(200).json({
        bytecode,
        abi
    })
}





export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "GET":
            return GET(req, res)
        case "POST":
            return POST(req, res)
    }
}
