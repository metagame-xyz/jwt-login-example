/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import { verifyMessage } from 'ethers/lib/utils';
import { AddressZ } from 'evm-translator/lib/interfaces/utils';
import React, { useContext, useEffect, useState } from 'react';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { useSignMessage } from 'wagmi';

import { signupSignature } from '.';
import { METABOT_BASE_API_URL } from './constants';

const withAuthentication = (Component) =>
    function ComponentWithAuth(props) {
        const { address: uncleanAddress } = useAccount({});
        const [address, setAddress] = useState(uncleanAddress);
        const [hasJwt, setJwt] = useState(false);
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState();

        const {
            data,
            error: signError,
            isLoading,
            signMessage,
        } = useSignMessage({
            onSuccess(signature, variables) {
                // Verify signature when sign message succeeds
                setLoading(true);
                const address = verifyMessage(variables.message, signature);

                return axios
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
                        localStorage.setItem('jwt_token', resp.data.token);
                        setJwt(true);
                        setLoading(false);
                    })
                    .catch((err) => setError(err.toString()));
            },
        });

        useEffect(() => {
            if (uncleanAddress) {
                setAddress(AddressZ.parse(uncleanAddress));
            } else {
                setAddress(uncleanAddress);
            }
        }, [uncleanAddress]);

        useEffect(() => {
            if (address && !loading) {
                setLoading(true);
                axios
                    .get(`${METABOT_BASE_API_URL}user/${address}`, {
                        headers: {
                            Authorization: localStorage.getItem('jwt_token') || '',
                            'X-Signup-Signature': signupSignature(address),
                        },
                    })
                    .then(({ data }) => {
                        const { isTokenGood, user: respUser } = data;
                        setUser(respUser);
                        setJwt(isTokenGood);
                        if (!isTokenGood) {
                            localStorage.removeItem('jwt_token');
                            signMessage({ message: `Nonce: ${respUser.nonce}` });
                        }
                        setLoading(false);
                    })
                    .catch((err) => {
                        setLoading(false);
                    });
            }
        }, [address]);

        return (
            <Component
                hasJwt={hasJwt}
                loading={loading}
                user={user}
                setUser={setUser}
                signMessage={signMessage}
                {...props}
            />
        );
    };

export default withAuthentication;
