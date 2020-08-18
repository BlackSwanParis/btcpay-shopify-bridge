require("dotenv").config();
const fs = require("fs");
const Shopify = require("shopify-api-node");
const btcpay = require("btcpay");
const keypair = btcpay.crypto.load_keypair(
    new Buffer.from(process.env.BTCP_KEY, "hex")
);

// Shopify client
const shopify = new Shopify({
    shopName: process.env.SHOPIFY_PREFIX,
    apiKey: process.env.SHOPIFY_KEY,
    password: process.env.SHOPIFY_PASSWORD,
});

// BTCPay client
const client = new btcpay.BTCPayClient(process.env.BTCPAY_URL, keypair, {
    merchant: process.env.MERCHANT,
});

// Here we store the invoices that have already been processed to avoid useless queries
let ids = [];

/**
 * @param {string} path 
 * @returns {Promise<string>}
 */
async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function (err, buf) {
            if (err) return reject(err);

            resolve(buf.toString());
        });
    });
}

/**
 * @param {string} path 
 * @param {string} content 
 * @returns {Promise<boolean>}
 */
async function writeFile(path, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, (err) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

/**
 * @param {string} path 
 * @returns {Promise<boolean>}
 */
async function checkFile(path) {
    return new Promise(resolve => {
        resolve(fs.existsSync(path));
    });
}

// Get the Shopify Order using the order name
/**
 * @param {string} name 
 * @returns {Promise<object>}
 */
function queryOrderId(name) {
    return new Promise((resolve, reject) => {
        shopify.order
            .list({
                limit: 1,
                name
            })
            .then(resolve)
            .catch(reject);
    });
}

// The main function
async function loop() {
    await new Promise(resolve => {
        client.get_invoices().then(async (invoices) => {
            // Filter the invoices to clean the array
            let inv = invoices.filter((x) => x.status === 'paid' && !ids.includes(x.id) && x.orderId);

            for (let i = 0; i < inv.length; i++) {
                let invoice = inv[i];

                ids.push(invoice.id);

                console.log('check', {
                    invoiceId: invoice.id
                });

                let name = invoice.orderId.substr(invoice.orderId.lastIndexOf(process.env.ORDER_PREFIX));

                // Query the order
                let order = await queryOrderId(name);

                order = order.length ? order[0] : false;

                // Check if the order is already processed to prevent error
                if (order && order.financial_status !== 'paid') {
                    // Create transaction attached to the order to mark as paid the order in Shopify BO
                    await shopify.transaction.create(order.id, {
                        "kind": "capture",
                        "authorization": "authorization-key"
                    }).catch(error => console.error('error found, more informations following', {
                        error,
                        order,
                        name,
                        invoice
                    }));
                }
            }

            await writeFile(process.env.STORE_FILE, JSON.stringify(ids));
            resolve(true);
        })
    }).catch(error => {
        // display the error and stop the program
        throw new Error(error);
    });

    // Re-execute the loop after 1s
    setTimeout(loop, 1000);

}

async function init() {
    if (await checkFile(process.env.STORE_FILE)) {
        ids = JSON.parse(await readFile(process.env.STORE_FILE));
    }

    loop();
}

init();