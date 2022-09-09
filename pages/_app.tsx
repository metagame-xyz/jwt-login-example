import { ChakraProvider, extendTheme, Flex } from '@chakra-ui/react';
import '@fontsource/arimo';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import '@rainbow-me/rainbowkit/styles.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { chains, wagmiClient } from 'utils/rainbowkit';
import { WagmiConfig } from 'wagmi';

import leftBg from '../images/left-bg.png';
import rightBg from '../images/right-bg.png';
import '../styles/globals.css';
import { theme } from '../styles/theme';

const bgSize = ['100px', '120px', '220px', '300px'];

function App({ Component, pageProps }: AppProps): JSX.Element {
    const { route } = useRouter();

    const hideNav =
        route.includes('generateGif') || route.includes('view') || route.includes('test');

    if (hideNav) {
        return <Component {...pageProps} />;
    } else {
        const Layout = dynamic(() => import('@components/Layout'));

        return (
            <ChakraProvider theme={theme}>
                <WagmiConfig client={wagmiClient}>
                    <SessionProvider session={pageProps.session} refetchInterval={0}>
                        <RainbowKitSiweNextAuthProvider>
                            <RainbowKitProvider
                                chains={chains}
                                theme={lightTheme({
                                    accentColor: '#FDFFFF',
                                    accentColorForeground: '#151515',
                                })}>
                                <Flex
                                    // backgroundImage={leftBg.src}
                                    // bgBlendMode="overlay"
                                    // bgPosition={'left 0px top -70px'}
                                    // bgSize={bgSize}
                                    width="100%"
                                    // bgRepeat="no-repeat repeat"
                                >
                                    <Flex
                                        // backgroundImage={rightBg.src}
                                        width="100%"
                                        // bgPosition={'right 0px top -70px'}
                                        // bgSize={bgSize}
                                        // bgRepeat="no-repeat repeat"
                                    >
                                        <Flex bgColor="brand.800" width="100%">
                                            <Layout>
                                                <Component {...pageProps} />
                                            </Layout>
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </RainbowKitProvider>
                        </RainbowKitSiweNextAuthProvider>
                    </SessionProvider>
                </WagmiConfig>
            </ChakraProvider>
        );
    }
}

export default App;
