$(document).ready(function() {
  const XIM_ASSET_CODE =
    'XIM-GBZ35ZJRIKJGYH5PBKLKOZ5L6EXCNTO7BKIL7DAVVDFQ2ODJEEHHJXIM';

  const XIM_PRICE_REFRESH_MS = 90 * 1000;

  class XimCurrencyConverter {
    setUsdPrice(usdPrice) {
      this.usdPrice = usdPrice;
    }

    setXlmPrice(xlmPrice) {
      this.xlmPrice = xlmPrice;
    }

    getXimPerUsd(numUsd = 1) {
      return numUsd / this.usdPrice || 0;
    }

    getUsdPerXim(numXim = 1) {
      return numXim * this.usdPrice || 0;
    }

    getXimPerXlm(numXlm = 1) {
      return numXlm / this.xlmPrice || 0;
    }

    getXlmPerXim(numXim = 1) {
      return numXim * this.xlmPrice || 0;
    }
  }

  class XimPriceWidgetController {
    constructor(ximCurrencyConverter, dataSources) {
      this.currentConvertTo = 'usd';

      this.ximCurrencyConverter = ximCurrencyConverter;
      this.dataSources = dataSources;

      this.loadXimRecentPrices();
      this.loadXimCurrentPrice();
      setInterval(() => this.loadXimCurrentPrice(), XIM_PRICE_REFRESH_MS);

      $('#toggle-conversion').click(() => this.toggleConversion());
      $('#toggle-calc').click(() => this.toggleCalculator());

      $('#calc-xim').keyup(e => {
        const xim = Number(e.target.value) || 0;
        $('#calc-usd').val(this.ximCurrencyConverter.getUsdPerXim(xim));
        $('#calc-xlm').val(this.ximCurrencyConverter.getXlmPerXim(xim));
      });

      $('#calc-xlm').keyup(e => {
        const xlm = Number(e.target.value) || 0;
        $('#calc-xim').val(
          Math.round(this.ximCurrencyConverter.getXimPerXlm(xlm))
        );
      });

      $('#calc-usd').keyup(e => {
        const usd = Number(e.target.value) || 0;
        $('#calc-xim').val(
          Math.round(this.ximCurrencyConverter.getXimPerUsd(usd))
        );
      });
    }

    toggleConversion() {
      const newConvertTo = this.currentConvertTo === 'usd' ? 'xlm' : 'usd';
      $(`.conversion--${this.currentConvertTo}`).addClass('hidden');
      $(`.conversion--${newConvertTo}`).removeClass('hidden');
      this.currentConvertTo = newConvertTo;
    }

    toggleCalculator() {
      this.resetCalculator();
      $('#calc').toggleClass('hidden');
    }

    resetCalculator() {
      $('#calc-xim').val(Math.round(this.ximCurrencyConverter.getXimPerUsd()));
      $('#calc-usd').val(1);
      $('#calc-xlm').val(this.ximCurrencyConverter.getXlmPerXim());
    }
    resetCalculator();

    loadXimCurrentPrice() {
      this.dataSources.getXimCurrentPrice().then(ximPrice => {
        this.ximCurrencyConverter.setUsdPrice(ximPrice.usd);
        this.ximCurrencyConverter.setXlmPrice(ximPrice.xlm);
        this.onPricesUpdated();
      });
    }

    loadXimRecentPrices() {
      this.dataSources.getXimRecentPrices().then(recentPrices => {
        this.updateSparkline(recentPrices);
      });
    }

    onPricesUpdated() {
      $('#usd-xim-price').text(this.ximCurrencyConverter.getUsdPerXim());
      $('#xim-usd-price').text(
        Math.round(this.ximCurrencyConverter.getXimPerUsd())
      );

      $('#xim-xlm-price').text(
        Math.round(this.ximCurrencyConverter.getXimPerXlm())
      );
      $('#xlm-xim-price').text(this.ximCurrencyConverter.getXlmPerXim());
    }

    updateSparkline(recentPrices) {
      $('#sparkline').sparkline(recentPrices, {
        type: 'line',
        width: '120',
        height: '20',
        lineColor: '#bfbf00',
        fillColor: '#f5f5f5',
        spotColor: '#4c4c4c'
      });
    }
  }

  class DataSources {
    getXimCurrentPrice() {
      return $.getJSON('https://api.stellarterm.com/v1/ticker.json')
        .then(json => {
          var xim = json.assets.find(asset => asset.id === XIM_ASSET_CODE);
          return {
            usd: xim.price_USD,
            xlm: xim.price_XLM
          };
        })
        .catch(error => console.log(error));
    }

    getXimRecentPrices() {
      return $.getJSON('https://www.exportid.com/bin/ximdata.json').then(
        json => {
          return json.usd.split(',');
        }
      );
    }
  }

  const ximCurrencyConverter = new XimCurrencyConverter();
  const dataSources = new DataSources();
  const controller = new XimPriceWidgetController(
    ximCurrencyConverter,
    dataSources
  );
  
});
