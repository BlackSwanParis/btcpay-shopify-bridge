# BTCPAY-Shopify Bridge

Imagine a world where you can pay on your favorite Shopify store using your Bitcoins...  
This world is now real !

## Installation

### Before next steps, follow theses instructions :

1. In your BTCPayServer store you need to check "Allow anyone to create invoice"
2. In Shopify Settings > Payment Providers > Manual Payment Methods add one which contains "Bitcoin with BTCPayServer"
3. In Shopify Settings > Checkout > Additional Scripts input the following script, with the details from your BTCPayServer :

```html
{% assign BTCPAY_URL = "FILL_HERE" %} {% assign STORE_ID = "FILL_HERE" %} {%
assign alreadySuccess = false %} {% for transaction in checkout.transactions %}
{% if transaction.status == 'success' %} {% assign alreadySuccess = true %} {%
endif %} {% endfor %} {% if alreadySuccess %}

<style>
  .content-box__row.text-container.content-box__row.text-container.content-box__row.text-container {
    display: none !important;
  }

  .content-box:first-child {
    display: none !important;
  }
</style>

{% endif %}

<script>
  const BTCPAYSERVER_URL = "{{ BTCPAY_URL }}";
  const STORE_ID = "{{ STORE_ID }}";
</script>
<script src="{{BTCPAY_URL}}/modal/btcpay.js"></script>
<script src="{{BTCPAY_URL}}/shopify/btcpay-browser-client.js"></script>
<script src="{{BTCPAY_URL}}/shopify/btcpay-shopify-checkout.js"></script>

<script>
  const STATUS = {{ alreadySuccess }};

  function detailsChanger() {
      if(!document.querySelectorAll('#main-header')[1] || !document.querySelector('.content-box__row.text-container')) {
          setTimeout(detailsChanger, 100);
          return;
      }
      document.querySelectorAll('#main-header')[0].innerHTML = document.querySelectorAll('#main-header')[1].innerText;
  }

  if(STATUS){
      console.log('success');
      detailsChanger();
  } else {
      console.log('not success')
  }

  let iframeState = false;

  setInterval(() => {
    if(iframeState && !document.querySelector('iframe[name="btcpay"]')) {
      window.location.reload()
    }

    iframeState = !!document.querySelector('iframe[name="btcpay"]');
  }, 100);
</script>
```

### Step 1 :

You must have NodeJs and NPM already installed on your favorite computer / server

`git clone git@github.com:BlackSwanParis/btcpay-shopify-bridge.git`  
`cd ./btcpay-shopify-bridge`  
`npm install`

## Step 2 :

Rename the `.env.example` file in `.env`

## Step 3 :

Into your shell, write and execute this command :  
`node -p "require('btcpay').crypto.generate_keypair().getPrivate('hex')"`  
Copy and past the string result after the `BTCP_KEY=` in your .env

## Step 4 :

Go into your BTCPay panel and go to your store settings > access token.  
Then, create new token and request pairing (and approve).

## Step 5 :

Now copy and replace the `1`,`2` and `3` by the following informations :

- 1 = The BTCPAY server URL
- 2 = The string you just generated (`BTCP_KEY`)
- 3 = The pairing code generated after the step 4

`BTCPAY_URL=1 BTCPAY_KEY=2 BTCPAY_PAIRCODE=3 node -e "const btcpay=require('btcpay'); new btcpay.BTCPayClient(process.env.BTCPAY_URL, btcpay.crypto.load_keypair(Buffer.from(process.env.BTCPAY_KEY, 'hex'))).pair_client(process.env.BTCPAY_PAIRCODE).then(console.log).catch(console.error)"`

### On windows !

`node -e "const BTCPAY_URL = "1", BTCPAY_KEY = "2", BTCPAY_PAIRCODE = "3"; const btcpay=require('btcpay'); new btcpay.BTCPayClient(BTCPAY_URL, btcpay.crypto.load_keypair(Buffer.from(BTCPAY_KEY, 'hex'))).pair_client(BTCPAY_PAIRCODE).then(console.log).catch(console.error)"`

Then you will have the merchant code, you have to copy and past it in the `.env` for the `MERCHANT=`

## Step 6

Fill the `BTCPAY_URL=` and `SHOPIFY_PREFIX=` values

## Step 7

On your Shopify Store Back office > Application > manage privates apps > create private app

And toggle the `orders` section into `read and write`

## Step 8

Then you can copy and past your Shopify application API Key to `SHOPIFY_KEY=` and the password to `SHOPIFY_PASSWORD=`

## Step 9

You can edit the order prefix with `ORDER_PREFIX=`, by default the prefix is `#`

## Step 10 and final step

Run the app with : `node ./app.js` or use pm2 to run the app in the background.

## Step 10 and final step in the background

Install pm2 :
`npm install pm2 -g` or `sudo npm install pm2 -g`

And run the app :
`pm2 start ./app.js`

And enjoy your life ;)

BlackSwan Paris

## Credits

- Thomas Tastet : Crazy Developer
- Paul ADW : Toxic Bitcoin Maximalist
