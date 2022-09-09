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
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getToken } from 'next-auth/jwt';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useConnect, useNetwork, useSignMessage } from 'wagmi';

import { GITHUB_CLIENT_ID, METABOT_BASE_API_URL, NETWORK } from '@utils/constants';
import withAuthentication from '@utils/withAuthentication';

const Home = () => {
    const { query } = useRouter();
    const [error, setError] = useState('');
    const [repoName, setRepoName] = useState('');
    const [commitCount, setCommitCount] = useState();
    const [message, setMessage] = useState(null);
    const { data: session } = useSession();

    const connectGithub = async () => {
        window.open(
            `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo:status%20user`,
            '_self',
        );
    };

    const { data: connectData, connectAsync, connectors } = useConnect();

    useEffect(() => {
        console.log(session);
    }, [session]);

    // const getGithubAuth = () => {
    //     const code = query.code;
    //     if (code && user && !user.githubUsername && hasJwt && !loading) {
    //         axios
    //             .post(
    //                 `${METABOT_BASE_API_URL}github/setCredentials`,
    //                 {
    //                     code,
    //                     address: user.address,
    //                 },
    //                 {
    //                     headers: {
    //                         Authorization: localStorage.getItem('jwt_token'),
    //                         'Content-Type': 'application/x-www-form-urlencoded',
    //                     },
    //                 },
    //             )
    //             .then(() => {
    //                 window.open(`http://localhost:3000`, '_self');
    //             })
    //             .catch((err) => {
    //                 console.log('endpt err', err);
    //             });
    //     }
    // };

    // const getCommitCount = () => {
    //     axios
    //         .get(`${METABOT_BASE_API_URL}github/getCommitCount?repo=${repoName}`, {
    //             headers: {
    //                 Authorization: localStorage.getItem('jwt_token'),
    //             },
    //         })
    //         .then(({ data }) => setCommitCount(data));
    // };
    // useEffect(() => {
    //     getGithubAuth();
    // }, [query, loading]);
    return (
        <Box align="center" justifyContent={'center'} minH="100vh">
            <ConnectButton />
            {/* <Text textColor={'white'}>
                {user && hasJwt ? `LOGGED IN: ${user.address}` : `NOT LOGGED IN`}
            </Text>
            {user && !user.githubUsername && hasJwt && !query?.code ? (
                <Button onClick={connectGithub}>Connect Github</Button>
            ) : null}
            {user?.githubUsername && hasJwt ? (
                <>
                    <Text textColor={'white'}>Welcome {user.githubUsername}</Text>
                    <HStack maxW="50%">
                        <Text textColor="white">Repository name</Text>
                        <Input
                            value={repoName}
                            onChange={(e) => {
                                setRepoName(e.target.value);
                                setCommitCount(undefined);
                            }}
                            placeholder="Repository name"
                            size="sm"
                            textColor={'white'}
                        />
                    </HStack>

                    <Button disabled={!repoName} onClick={getCommitCount}>
                        Get commit count
                    </Button>
                    {commitCount || commitCount === 0 ? (
                        <Text>
                            {commitCount} commits to {repoName}
                        </Text>
                    ) : null}
                </>
            ) : null}{' '}
            <Text textColor="red">{error}</Text> */}
        </Box>
    );
};

export default Home;
