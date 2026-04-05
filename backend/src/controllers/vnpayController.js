import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";

const vnpay = new VNPay({
    tmnCode: "131RF10U",
    secureSecret: "COYB5S8953FIO08O1MPBKLAVAZ79GBVY",
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true,
    hashAlgorithm: "SHA512",
    loggerFn: ignoreLogger,
});

export const createPaymentUrl = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Thiếu amount" });
        }

        const txnRef = `ORDER_${Date.now()}`;

        const paymentUrl = await vnpay.buildPaymentUrl({
            vnp_Amount: amount,
            vnp_IpAddr: "127.0.0.1",
            vnp_TxnRef: String(txnRef),
            vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
            vnp_OrderType: ProductCode.Other,
            vnp_Locale: VnpLocale.VN,
            vnp_ReturnUrl: `${process.env.SERVER_URL || 'http://localhost:9999'}/api/vnpay/return`,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(new Date(Date.now() + 60 * 60 * 1000)),
        });

        return res.status(200).json({
            paymentUrl,
            txnRef,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Tạo link thất bại",
            error: error.message,
        });
    }
};

export const vnpayReturn = async (req, res) => {
    const data = req.query;
    if (
        data.vnp_ResponseCode === "00" &&
        data.vnp_TransactionStatus === "00"
    ) {
        return res.redirect("http://localhost:5173/order-success?paymentStatus=success");
    }

    return res.redirect("http://localhost:5173/order-success?paymentStatus=failed");
};