<script setup>
import {computed, nextTick, onMounted, reactive, shallowRef} from "vue";
import AddProduct from "@/components/AddProduct.vue";
import Property from "@/components/Property.vue";
import {getPrice, money, urlProduct} from "@/helpers.js";
import ShareDialog from "@/components/ShareDialog.vue";

const {data} = defineProps(['data']);
const discounts_count = data.discounts_count;

discounts_count.sort((a, b) => {
  if (a.min || 0 < b.min || 0) {
    return 1;
  } else if (a.min || 0 > b.min || 0) {
    return -1;
  }
  // a must be equal to b
  return 0;
});


const withNDS = shallowRef(false);
const showAdd = shallowRef(false);
const showShare = shallowRef(false);
const shareUrl = shallowRef('');

const products = reactive([]);
const resultCalc = computed(() => {
  let items = new Map();
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    let c = +item.count;
    if (!c || c <= 0) {
      c = 1;
    }
    let price = c * item.price;
    let s = 0;
//console.log('discounts_count', discounts_count);
    const ds = discounts_count.find(v => v.min <= c);
    if (ds) {
      s = ds.val / 100;
    }

    if (s > 0) {
      price = price * (1 - s);
    }
    let priceOptions = 0;
    // const oneProps = new Set();
    const propsDisabled = new Set();
    const propsPrices = new Map();
    data.properties.forEach((prop) => {
      const disabled = prop.parent && !item.options[prop.parent].enable;
      if (disabled) {
        propsDisabled.add(prop.name);
        return;
      }
      let enable = item.options[prop.name] && item.options[prop.name].enable;
      if (!enable && item.options[prop.name] && prop.parent && item.options[prop.parent].enable && prop.together) {
        item.options[prop.name].enable = true;
        enable = true;
      }

      if (enable) {
        /*if (prop.name.once && oneProps.has(prop.name)) {
          return ;
        }*/

        let pr = 0;
        if (prop.type === 'checkbox') {
          pr = getPrice(prop.prices, c, withNDS.value);
        } else {
          if (item.options[prop.name].value !== 'null') {
            pr = getPrice(prop.options[item.options[prop.name].value].prices, c, withNDS.value);
          }
        }
        if (!prop.once) {
          pr = pr * c;
        }
        propsPrices.set(prop.name, pr);
        priceOptions += pr;
        // if (prop.name.once) {
        //   oneProps.add(prop.name);
        // }
      }
    });


    items.set(item.id, {
      priceProduct: price,
      price: priceOptions + price,
      priceOptions,
      propsDisabled,
      propsPrices,
      count: c,
      discount: s * 100
    });

  }
  return items;


})
const amountTotal = computed(() => {
  let c = 0;
  resultCalc.value.forEach(value => {
    c += value.price;
  });
  return c.toFixed(2);
});

function reset() {
  while (products.length) products.shift();
  window.location.hash = '';
}

async function restoreFromUrl() {
  const d = location.hash.replace('#', '');
  if (d && d !== '') {
    const data = JSON.parse(atob(d));
    console.log('data', data)
    const products = await Promise.all(data[0].map((item) => {

      return new Promise(async (resolve, reject) => {
        await fetch(urlProduct + '?article=' + encodeURIComponent(item[0].trim())).then(res => res.json()).then((res) => {
          const item2 = [...item];
          item2[0] = res;
          return resolve(item2);
        }).catch(e => reject(e));

      });

    }));

    console.log('products', products);
    for (const product of products) {
      addProduct(product[0], product[1], product[2].map(([v1, v2]) => ({
        enable: v1,
        value: v2
      })))
    }
    withNDS.value = data[1];

    await nextTick();
    console.log(amountTotal.value, data[2]);
    if (data[2] !== amountTotal.value) {
      alert('Цена изменилась');
      throw new Error('changed price');
    }

  }
  window.location.hash = '';
}

onMounted(async () => {
  try {
    await restoreFromUrl();
  } catch (e) {
    console.log(e);
    reset();
  }

});

function addProduct(p, count = 1, values = null) {
  console.log(p, count, values);
  showAdd.value = false;
  if (products.find(v => v.id === p.id)) {
    return;
  }

  products.push({
    ...p,
    count: count,
    options: data.properties.reduce((acc, v, i) => {
      return {
        ...acc,
        [v.name]: (values && values[i]) ? values[i] : {
          enable: false,
          value: 0
        },
      }
    }, {})
  });
}

function removeProduct(product) {
  const i = products.findIndex(v => v.id === product.id);
  if (i !== -1) {
    products.splice(i, 1);
  }
  if (product.length === 0) {
    window.location.hash = '';
  }
}

function getShare() {
  const data = [];
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    data.push([item.article, item.count, Object.values(item.options).map(v => [v.enable, v.value])]);
  }

  return [data, withNDS.value, amountTotal.value];
}

function share() {
  const data = btoa(JSON.stringify(getShare()));
  // window.location.hash = data;
  shareUrl.value = window.location.origin + window.location.pathname + '#' + data;
  showShare.value = true;
}


</script>

<template>
  <div class="calc">
    <div class="calc__items">
      <div class="calc__item" v-for="product in products" :key="product.id">

        <div class="calc__product-info">
          <a class="calc__product-link" :href="'/'+product.uri" target="_blank">
            <div class="calc__product-img-wrap"><img class="calc__product-img" :src="product.thumb"/></div>
            <div class="calc__product-name">{{ product.name }}</div>
            <div class="calc__product-article">{{ product.article }}</div>
            <div class="calc__product-price">{{ money(product.price) }}</div>
          </a>
          <div class="calc__remove-product close-callback" title="Удалить товар" @click="removeProduct(product)"></div>
        </div>
        <table style="width: 100%;margin-top: 20px;">
          <tr>
            <th></th>
            <th></th>
            <th style="text-align: right">Сумма</th>
          </tr>
        </table>
        <div class="calc__product-count">
          <label><span>Количество</span><input min="1" type="number" v-model="product.count"></label>
          <div class="calc__product-discount">Скидка {{ resultCalc.get(product.id).discount }}%</div>
          <div class="calc__product-price-with-count">{{ money(resultCalc.get(product.id).priceProduct) }}</div>
        </div>
        <table class="calc__properties">
          <Property class="calc__properties-item" v-for="(prop, index) in data.properties"
                    v-model="product.options[prop.name]"
                    :prop="prop"
                    :key="prop.name"
                    :product="product"
                    :count="resultCalc.get(product.id).count"
                    :withNDS="withNDS"
                    :priceTotal="resultCalc.get(product.id).propsPrices.get(prop.name) || 0"
                    :disable="resultCalc.get(product.id).propsDisabled.has(prop.name)"
          />

          <tr class="calc__properties-item calc__properties-item-total">
            <td colspan="2"></td>

            <th style="text-align: right">{{ money(resultCalc.get(product.id).price) }}</th>
          </tr>
        </table>
      </div>
    </div>
    <div class="calc__action">
      <button class="btn" @click="showAdd = true">+ Добавить товар</button>
    </div>
    <div class="calc__summary" v-show="products.length>0">
      <table class="calc__summary-table">
        <tr>
          <th>Сумма заказа</th>
          <td><span class="calc__product-price-total">{{ money(amountTotal) }}</span></td>
        </tr>
        <tr>
          <th></th>
          <td>
            <div class="calc__checkbox">
              <input type="checkbox" name="checkbox_agree_privacy" id="inp_calc_win_nds" v-model="withNDS"/>
              <label for="inp_calc_win_nds">
                c НДС
              </label>
            </div>
          </td>
        </tr>
      </table>
      <div class="calc__share-row" >
        <button class="btn calc__btn-link" @click="share">Поделиться</button>
      </div>
      <div class="calc__link calc__reset" @click="reset">Сбросить и посчитать заново</div>
    </div>
    <AddProduct @add="addProduct" v-model:show="showAdd"/>
    <ShareDialog :url="shareUrl" v-model:show="showShare"/>

  </div>
</template>

<style lang="scss">
@use "@/assets/main.scss" as *;

.calc-error {
  color: #ef3535;
}

.calc-success {
  color: green;
}

.calc {
  text-align: left;
  color: black;
  font-size: 16px;
  font-weight: 300;

  &__action {
    text-align: center;
  }

  td:first-child, th:first-child {
    text-align: left;
  }

  label {
    font-weight: 500;
  }
  &__share-row {
    margin-bottom: 20px;
    margin-top: 20px;
    display: flex;
    .btn {
      margin-right: 0;
    }
  }


  &__link {
    color: var(--color-main-text);
    border-bottom: 1px dashed var(--color-main-text);
    cursor: pointer;
    display: inline-block;

  }

  &__items {
    background-color: #f1f0f0;
    padding: 20px;
    margin-bottom: 30px;

    &:empty {
      display: none;
    }
  }

  &__item {
    margin-bottom: 30px;
    padding: 10px;
    border: 1px dashed #d9b9a1;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__product-link {
    display: flex;
    align-items: center;
    font-weight: bold;

    & > * {
      margin-right: 20px;
    }

    @include mobile {
      flex-wrap: wrap;
      .calc__product-img-wrap {
        width: calc(100% - 40px);
        margin-bottom: 20px;
      }
    }
  }

  &__product-info {
    display: flex;
    justify-content: space-between;
  }

  &__product-img {
    height: 44px;
  }

  &__product-price-total {
    font-family: "Arno Pro";
    font-weight: bold;
    font-size: 22px;
    color: #b3765d;
    letter-spacing: 1.9px;

  }

  &__remove-product {
    position: relative;
    z-index: 5;
  }

  &__product-count {
    display: flex;
    justify-content: space-between;
    //margin-top: 20px;
    align-items: center;

    label {
      display: flex;
      align-items: center;
      margin-right: 20px;
    }

    span {
      display: flex;
      margin-right: 20px;
    }

    @include mobile {
      flex-wrap: wrap;
      label {
        width: 100%;
        margin-bottom: 20px;
      }
    }
    @include mobile2 {
      label {
        display: flex;
        flex-wrap: wrap;

        span {
          display: block;
          width: 100%;
          margin-bottom: 10px;
          text-align: left;
        }
      }
    }
  }

  &__product-price-with-count {
    margin-left: auto;
  }

  &__properties {
    margin-top: 20px;
    width: 100%;

    td {
      padding: 10px 0;
    }

    @include mobile {
      display: block;
      tr {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }

  &__properties-item {
    @include mobile {
      padding: 10px 0;
      &:last-child {
        margin-bottom: 0;
      }
      border-bottom: 1px dashed #d9b9a1;
      &:first-child {
        border-top: 1px dashed #d9b9a1;
      }
      &:last-child {
        margin-top: 20px;
        border-bottom: none;
      }
      &-total {
        th:last-child {
          width: 100%;
        }
      }
    }

  }

  &__summary {
    margin-top: 20px;
  }

  &__summary-table {
    width: 100%;

    th:nth-child(1) {
      text-align: left;
    }

    td:nth-child(2) {
      text-align: right;
    }
  }
}

</style>
