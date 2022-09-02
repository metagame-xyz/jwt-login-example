import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Image,
    Input,
    Link,
    Text,
    VStack,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { GITHUB_CLIENT_ID, METABOT_BASE_API_URL, NETWORK } from '@utils/constants';
import withAuthentication from '@utils/withAuthentication';

const Home = withAuthentication(
    ({ hasJwt, user, setUser = (a) => a, loading, signMessage = (a) => a }) => {
        const { query } = useRouter();
        const [error, setError] = useState('');
        const [repoName, setRepoName] = useState('');
        const connectGithub = async () => {
            window.open(
                `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`,
                '_self',
            );
        };

        const getGithubAuth = () => {
            const code = query.code;
            if (code && user && !user.githubUsername && hasJwt && !loading) {
                axios
                    .post(
                        `${METABOT_BASE_API_URL}github/setCredentials`,
                        {
                            code,
                            address: user.address,
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem('jwt_token'),
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        },
                    )
                    .then(() => {
                        window.open(`http://localhost:3000`, '_self');
                    })
                    .catch((err) => {
                        console.log('endpt err', err);
                    });
            }
        };

        const getCommitCount = () => {
            axios
                .get(`${METABOT_BASE_API_URL}github/getCommitCount?repo=${repoName}`, {
                    headers: {
                        Authorization: localStorage.getItem('jwt_token'),
                    },
                })
                .then((data) => {
                    console.log('COMMIT COUNT RESP', data);
                });
        };
        useEffect(() => {
            if (user && !loading && !hasJwt && query?.code) {
                signMessage({ message: `Nonce: ${user.nonce}` });
            }
            getGithubAuth();
        }, [query, loading]);

        return (
            <Box align="center" justifyContent={'center'} minH="100vh">
                <ConnectButton />
                <Text textColor={'white'}>
                    {user ? `LOGGED IN: ${user.address}` : `NOT LOGGED IN`}
                </Text>
                {user && !user.githubUsername && !query?.code ? (
                    <Button onClick={connectGithub}>Connect Github</Button>
                ) : null}
                {user && !loading && !hasJwt && query?.code ? (
                    <Text textColor="white">Sign the message!</Text>
                ) : null}
                {user?.githubUsername ? (
                    <>
                        <Text textColor={'white'}>Welcome {user.githubUsername}</Text>
                        <HStack maxW="50%">
                            <Text textColor="white">Repository name</Text>
                            <Input
                                value={repoName}
                                onChange={(e) => setRepoName(e.target.value)}
                                placeholder="Repository name"
                                size="sm"
                                textColor={'white'}
                            />
                        </HStack>

                        <Button onClick={getCommitCount}>Get commit count</Button>
                    </>
                ) : null}{' '}
                <Text textColor="red">{error}</Text>
            </Box>
        );
    },
);

export default Home;
