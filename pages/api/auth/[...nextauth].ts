import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';

import { METABOT_BASE_API_URL } from '@utils/constants';
import { frontendSignature, signupSignature } from '@utils/index';

export default async function auth(req, res) {
    const providers = [
        CredentialsProvider({
            name: 'Ethereum',
            credentials: {
                message: {
                    label: 'Message',
                    type: 'text',
                    placeholder: '0x0',
                },
                signature: {
                    label: 'Signature',
                    type: 'text',
                    placeholder: '0x0',
                },
            },
            async authorize(credentials) {
                try {
                    const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));

                    const nextAuthUrl =
                        process.env.NEXTAUTH_URL ||
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

                    if (!nextAuthUrl) {
                        return null;
                    }

                    const nextAuthHost = new URL(nextAuthUrl).host;
                    if (siwe.domain !== nextAuthHost) {
                        return null;
                    }

                    if (siwe.nonce !== (await getCsrfToken({ req }))) {
                        return null;
                    }

                    await siwe.validate(credentials?.signature || '');
                    return {
                        id: siwe.address,
                    };
                } catch (e) {
                    return null;
                }
            },
        }),
    ];

    const isDefaultSigninPage = req.method === 'GET' && req.query.nextauth.includes('signin');

    if (isDefaultSigninPage) {
        providers.pop();
    }

    return await NextAuth(req, res, {
        providers,
        session: {
            strategy: 'jwt',
        },
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            async session({ session, token }) {
                const address = token.sub;
                session.address = token.sub;

                try {
                    const { data: user } = await axios.get(
                        `${METABOT_BASE_API_URL}user/${address}`,
                        {
                            headers: {
                                'x-signup-signature': signupSignature(address),
                                'x-frontend-signature': frontendSignature(address),
                            },
                        },
                    );
                    session.user = user;
                } catch (err) {
                    res.status(500).json(err);
                } finally {
                    return session;
                }
            },
        },
    });
}
