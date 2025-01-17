import { getDefaultProvider } from '@ethersproject/providers';
// import { WebClient } from '@slack/web-api';
import { createHmac } from 'crypto';
import { ethers } from 'ethers';
import Redis from 'ioredis';
import type { NextApiRequest } from 'next';
import fetch from 'node-fetch-retry';
import { addressToName, addressToNameObject } from 'onoma';

// import fetch, { Response } from 'node-fetch';
import { logger } from '@utils/logging';

import {
    ALCHEMY_NOTIFY_TOKEN,
    ALCHEMY_PROJECT_ID,
    ETHERSCAN_API_KEY,
    INFURA_PROJECT_ID,
    networkStrings,
    POCKET_NETWORK_API_KEY,
    POCKET_NETWORK_ID,
    SIGNUP_AUTH_TOKEN,
} from './constants';

// const slackClient = new WebClient(SLACK_API_TOKEN);

export const defaultProvider = getDefaultProvider(networkStrings.ethers, {
    etherscan: ETHERSCAN_API_KEY,
    infura: INFURA_PROJECT_ID,
    alchemy: ALCHEMY_PROJECT_ID,
    pocket: {
        applicationId: POCKET_NETWORK_ID,
        applicationSecretKey: POCKET_NETWORK_API_KEY,
    },
});

export const defaultMainnetProvider = getDefaultProvider('homestead', {
    etherscan: ETHERSCAN_API_KEY,
    infura: INFURA_PROJECT_ID,
    alchemy: ALCHEMY_PROJECT_ID,
    pocket: {
        applicationId: POCKET_NETWORK_ID,
        applicationSecretKey: POCKET_NETWORK_API_KEY,
    },
});

export const isValidAlchemySignature = (request: NextApiRequest) => {
    if (process.env.VERCEL_ENV !== 'production') {
        return true;
    }
    const token = ALCHEMY_NOTIFY_TOKEN;
    const headers = request.headers;
    const signature = headers['x-alchemy-signature'] || 'no signature';
    const body = request.body;
    const hmac = createHmac('sha256', token); // Create a HMAC SHA256 hash using the auth token
    hmac.update(JSON.stringify(body), 'utf8'); // Update the token hash with the request body using utf8
    const digest = hmac.digest('hex');
    return signature === digest;
};

export const checkSignature = (message: string, joinedSignature: string, walletAddress: string) => {
    const digest = ethers.utils.id(message);
    const signature = ethers.utils.splitSignature(joinedSignature);
    const recoveredAddress = ethers.utils.recoverAddress(digest, signature);
    return walletAddress === recoveredAddress;
};

export const signMessage = (address) => {
    const hmac = createHmac('sha256', SIGNUP_AUTH_TOKEN); // Create a HMAC SHA256 hash using the auth token
    hmac.update(JSON.stringify(address), 'utf8'); // Update the token hash with the request body using utf8
    const digest = hmac.digest('hex');
    return digest;
};

export const signupSignature = (address) => signMessage(address);

export const tsToMonthAndYear = (ts: number): string => {
    const date = ts ? new Date(ts * 1000) : new Date();
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const formatDateObjToTime = (dateObj: Record<string, number>): string => {
    const { hour, minute, second } = dateObj;
    const ampm = hour >= 12 ? 'pm' : 'am';
    let ampmHour = hour % 12;
    ampmHour = ampmHour ? ampmHour : 12; // the hour '0' should be '12'
    const minuteStr = minute < 10 ? '0' + minute : minute;
    const secondStr = second < 10 ? '0' + second : second;
    return `${ampmHour}:${minuteStr}:${secondStr} ${ampm}`;
};

export const getUserName = async (address: string, provider = defaultMainnetProvider) => {
    let ensName = null;
    ensName = await provider.lookupAddress(address);
    if (ensName) return ensName;
    return addressToName(address);
};
