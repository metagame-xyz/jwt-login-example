import { Box, Flex, Heading, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { datadogRum } from '@datadog/browser-rum';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import axios from 'axios';
import { BigNumber, ethers } from 'ethers';
import { verifyMessage } from 'ethers/lib/utils';
import { AddressZ } from 'evm-translator/lib/interfaces/utils';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { useSignMessage } from 'wagmi';

import { signupOptions } from '@utils';
import { blackholeAddress, METABOT_BASE_API_URL, NETWORK } from '@utils/constants';

const registerUser = async (address) => {
    console.log('register');
    const body = {
        address,
        // sources: ['Jwt_example'],
    };
    console.log('signing up...', body, signupOptions(body));
    return axios
        .post(`${METABOT_BASE_API_URL}user/signup`, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        .then((resp) => {
            console.log('SIGNED UP');
            return address;
        })
        .catch((err) => {
            console.log('sign up err', err);
            throw new Error('Sign up error');
        });
};

const checkIfUserExists = async (address) => {
    const { data } = await axios.get(`${METABOT_BASE_API_URL}user/${address}`);
    if (address.toLowerCase() === data?.address.toLowerCase()) {
        return address;
    }
    return await registerUser(address);
};

const Home = ({ metadata }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const { address: uncleanAddress } = useAccount({
        onConnect({ address, connector, isReconnected }) {
            checkIfUserExists(address)
                .then(() => {
                    getNonce(address);
                })
                .then((resp) => {})
                .catch((err) => console.log(err.toString()));
        },
        onDisconnect: datadogRum.removeUser,
    });

    const {
        data,
        error: signError,
        isLoading,
        signMessage,
    } = useSignMessage({
        onSuccess(signature, variables) {
            // Verify signature when sign message succeeds

            const address = verifyMessage(variables.message, signature);
            console.log('verified', variables, signature);

            axios
                .post(
                    `${METABOT_BASE_API_URL}user/signature`,
                    {
                        address,
                        signature,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                )
                .then((resp) => {
                    console.log('JWT', resp.data.token);
                });
        },
    });

    const getNonce = async (address) => {
        const { data: nonce } = await axios.get(`${METABOT_BASE_API_URL}user/nonce/${address}`);
        if (!nonce) {
            setError('Could not get nonce');
        }
        await signMessage({ message: `Nonce: ${nonce}` });
        setLoggedIn(true);
    };
    const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress;

    const { chain } = useNetwork();

    const provider = useProvider();

    const { data: signer } = useSigner();

    return (
        <Box align="center" justifyContent={'center'} minH="100vh">
            <ConnectButton />
            <p>{loggedIn ? `LOGGED IN: ${address}` : `NOT LOGGED IN`}</p>
        </Box>
    );
};

export default Home;
