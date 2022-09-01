import { Box, Button, Flex, Heading, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { datadogRum } from '@datadog/browser-rum';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import axios from 'axios';
import { BigNumber, ethers } from 'ethers';
import { verifyMessage } from 'ethers/lib/utils';
import { AddressZ } from 'evm-translator/lib/interfaces/utils';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { useSignMessage } from 'wagmi';

import { signupOptions } from '@utils';
import {
    blackholeAddress,
    GITHUB_CLIENT_ID,
    METABOT_BASE_API_URL,
    NETWORK,
} from '@utils/constants';

const registerUser = async (address) => {
    const body = {
        address,
        // sources: ['Jwt_example'],
    };
    return axios
        .post(`${METABOT_BASE_API_URL}user/signup`, body, signupOptions(body))
        .then((resp) => {
            console.log('SIGNED UP');
            return address;
        })
        .catch((err) => {
            console.log('sign up err', err);
            throw new Error('Sign up error');
        });
};

const Home = ({ metadata }) => {
    const { query } = useRouter();

    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('jwt_token'));
    const [githubAuth, setGithubAuth] = useState();

    const [error, setError] = useState('');
    const { address: uncleanAddress } = useAccount({
        onConnect({ address, connector, isReconnected }) {
            checkIfUserExists(address)
                .then(() => {
                    if (!loggedIn) {
                        getNonce(address);
                    }
                })
                .then((resp) => {})
                .catch((err) => {
                    setLoggedIn(false);
                    console.log(err.toString());
                });
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
                    setLoggedIn(true);
                    localStorage.setItem('jwt_token', resp.data.token);
                });
        },
    });

    const checkIfUserExists = async (address) => {
        const { data } = await axios.get(`${METABOT_BASE_API_URL}user/${address}`);
        if (address.toLowerCase() === data?.address.toLowerCase()) {
            return address;
        }
        setLoggedIn(false);
        return await registerUser(address);
    };

    const getNonce = async (address) => {
        const { data: respNonce } = await axios.get(`${METABOT_BASE_API_URL}user/nonce/${address}`);
        if (!respNonce) {
            setError('Could not get nonce');
        }
        await signMessage({ message: `Nonce: ${respNonce}` });
    };
    const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress;

    const { chain } = useNetwork();

    const provider = useProvider();

    const { data: signer } = useSigner();

    useEffect(() => {
        const code = query.code;
        console.log(localStorage.getItem('jwt_token'));
        if (code && !githubAuth && loggedIn) {
            axios
                .post(
                    `${METABOT_BASE_API_URL}github/setCredentials`,
                    {
                        code,
                        address,
                    },
                    {
                        headers: {
                            Authorization: localStorage.getItem('jwt_token'),
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                )
                .then(({ data }) => {
                    setGithubAuth(data);
                })
                .catch((err) => {
                    console.log('endpt err', err);
                });
        }
    }, [query]);

    return (
        <Box align="center" justifyContent={'center'} minH="100vh">
            <ConnectButton />
            <Text textColor={'white'}>{loggedIn ? `LOGGED IN: ${address}` : `NOT LOGGED IN`}</Text>
            {loggedIn && !githubAuth ? (
                <Button
                    onClick={() =>
                        window.open(
                            `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`,
                            '_blank',
                        )
                    }>
                    Connect Github
                </Button>
            ) : null}
            {githubAuth ? <Text textColor={'white'}>Welcome {githubAuth.login}</Text> : null}{' '}
        </Box>
    );
};

export default Home;
