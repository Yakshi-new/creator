import { useCallback } from 'react';
import api from '@/lib/api';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const useRazorpay = () => {
    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const initiatePayment = useCallback(async (options: {
        amount: number,
        type: 'WALLET_DEPOSIT' | 'SUBSCRIPTION' | 'PAID_POST',
        creatorId?: number,
        onSuccess?: (response: any) => void,
        onError?: (error: any) => void
    }) => {
        try {
            // 1. Create order on server
            const { data: orderData } = await api.post('/payment/create-order', {
                amount: options.amount,
                type: options.type,
                creatorId: options.creatorId
            }) as { data: any };

            // 2. Handle Mock Payment for Local Development
            if (orderData.orderId.startsWith('mock_')) {
                console.log("Mock payment flow detected");
                const { data: verifyData } = await api.post('/payment/verify-payment', {
                    razorpay_order_id: orderData.orderId,
                    razorpay_payment_id: `mock_pay_${Date.now()}`,
                    razorpay_signature: 'mock_signature'
                }) as { data: any };

                if (verifyData.success) {
                    if (options.onSuccess) options.onSuccess(verifyData);
                } else {
                    if (options.onError) options.onError(verifyData);
                }
                return;
            }

            // 3. Open Razorpay Checkout for real orders
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

            if (!res) {
                alert('Razorpay SDK failed to load. Are you online? If you are testing locally, maybe the server didn\'t return a mock order.');
                return;
            }

            const rzpOptions = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "CREATOR HUB",
                description: options.type.replace('_', ' '),
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        // Verification on server
                        const { data: verifyData } = await api.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }) as { data: any };

                        if (verifyData.success) {
                            if (options.onSuccess) options.onSuccess(verifyData);
                        } else {
                            if (options.onError) options.onError(verifyData);
                        }
                    } catch (error) {
                        console.error("Verification error:", error);
                        if (options.onError) options.onError(error);
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: ""
                },
                notes: {
                    address: "Creator Hub Platform"
                },
                theme: {
                    color: "#E11D48" // Rose 600
                }
            };

            const paymentObject = new window.Razorpay(rzpOptions);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response: any) {
                alert("Payment Failed: " + response.error.description);
                if (options.onError) options.onError(response.error);
            });

        } catch (error: any) {
            console.error("Initiate payment error:", error);
            alert(error.response?.data?.message || "Failed to initiate payment");
        }
    }, []);

    return { initiatePayment };
};
