import { Box, Flex, Heading, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { datadogRum } from '@datadog/browser-rum';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Analytics from 'analytics';
import axios from 'axios';
import { BigNumber, ethers } from 'ethers';
import { AddressZ } from 'evm-translator/lib/interfaces/utils';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import nomadWhitehatAbi from 'utils/nomadWhitehatAbi';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

import BigButton from '@components/BigButton';
import CustomConnectButton from '@components/ConnectButton';
import { Etherscan, Opensea, TwelveCircles } from '@components/Icons';
import MintButton, { MintStatus } from '@components/MintButton';

import { ioredisClient } from '@utils';
import { blackholeAddress, METABOT_BASE_API_URL, NETWORK } from '@utils/constants';
import { SEGMENT_KEY } from '@utils/constants';
import { copy } from '@utils/content';
import useWindowDimensions from '@utils/frontend';

export const getServerSideProps = async () => {
    const metadata = await ioredisClient.hget('2', 'metadata');
    return {
        props: {
            metadata: JSON.parse(metadata),
        },
    };
};

function About({ heading, text }) {
    return (
        <VStack maxW={['sm', 'md', 'md', 'full']}>
            <Heading as="h2" fontSize="24px">
                {heading}
            </Heading>
            <Text align="center">{text}</Text>
        </VStack>
    );
}

const toastErrorData = (title: string, description: string) => ({
    title,
    description,
    status: 'error',
    position: 'top',
    duration: 8000,
    isClosable: true,
});

const Home = ({ metadata }) => {
    const { address: uncleanAddress } = useAccount({
        onConnect({ address, connector, isReconnected }) {
            console.log('Connected', { address, connector, isReconnected });
        },
        onDisconnect: datadogRum.removeUser,
    });
    const { chain } = useNetwork();
    const address = uncleanAddress ? AddressZ.parse(uncleanAddress) : uncleanAddress;

    const provider = useProvider();

    const { data: signer } = useSigner();

    const [mintStatus, setMintStatus] = useState<MintStatus>(MintStatus.unknown);

    return (
        <Box align="center" justifyContent={'center'} minH="100vh">
            <ConnectButton />
        </Box>
    );
};

export default Home;
