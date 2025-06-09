<script setup>
import {getPrice, money} from "@/helpers.js";
import {computed, watch} from "vue";
import vSelect from "vue-select";
import "@/assets/vue-select.css";

const model = defineModel();
const emit = defineEmits(['update:modelValue'])
const props = defineProps(['disable', 'prop', 'withNDS', 'count', 'product', 'priceTotal'])
const index = Math.random();

watch(() => props.disable, () => {
  if (props.disable && model.value.enabled) {
    model.value.enabled = false;
    // model.value = {...model.value};
  }
}, {immediate: true});

const options = computed(() => {

  return [...props.prop.options.map((v, i) => ({
    label: v.name + ' ' + money(getPrice(v.prices, props.count, props.withNDS)),
    value: i, ...v
  })).filter((item) => {
    const sku = item.sku || item.article;
    if (sku) {
      return props.product.article.indexOf(sku) === 0;
    }
    return true;
  }), {label: 'нет', value: 'null'}];
});

watch(() => model.value.value, () => {
  console.log('model.value', model.value, model.value.enable)
  if (model.value.value === 'null') {
    model.value.enable = false;
  } else {
    model.value.enable = true;
  }
  // model.value = {...model.value};
});
if (props.prop.type !== 'checkbox') {
  watch(() => model.value.enable, () => {
    if (model.value.enable && model.value.value === 'null') {
      model.value.value = 0;
    }
  });
}

function clickSelect() {
  console.log('model.value2', model.value, model.value.enable)
  if (model.value.value === 'null') {
    model.value.enable = false;
  } else {
    model.value.enable = true;
  }
}

</script>

<template>
  <tr class="calc__property"
       :class="{
    'calc__property--disable': props.disable,
    'calc__property--checkbox':props.prop.type=='checkbox',
    'calc__property--together':!!props.prop.together
    }"
  >
    <td class="calc__property-checkbox" :colspan="props.prop.type=='checkbox'?2:1">
      <input type="checkbox" :id="`int_calc_prop_${index}`" v-model="model.enable"/>
      <label :for="`int_calc_prop_${index}`">
        <span class="calc__property-name-n">{{ props.prop.name }}</span>
        <span v-if="props.prop.type=='checkbox'" class="calc__property-price">
          {{ money(getPrice(props.prop.prices, props.count, props.withNDS)) }}
        </span>
      </label>
      <div  v-if="props.prop.hint" class="calc__property-name-h" colspan="3" >{{ props.prop.hint }}</div>
    </td>

    <td v-if="props.prop.type!=='checkbox'" class="calc__property-options">
      <v-select @click="clickSelect" :searchable="false" :clearable="false" :options="options" label="label" :key="props.count+(props.withNDS?'t':'f')"
                :reduce="(option) => option.value" v-model="model.value"></v-select>
    </td>

    <td class="calc__property-price-total">{{ money(props.priceTotal) }}</td>


  </tr>
</template>

<style lang="scss">
@use "@/assets/main.scss" as *;

.calc__property {

  &--disable {
    cursor: default;
    pointer-events: none;
    &>* {
      opacity: 0.4;
    }
  }
  &:not(.calc__property--checkbox) .calc__property-checkbox {
    @include mobile {
      width: 100%;
    }
  }



  &-name-h {
    font-size: 16px;
  //  color: #b4b4b4;
    color: #505050;
  }

  &-checkbox label {
    padding: 0 !important;
  }

  &-checkbox label::before {
    display: inline-block !important;
    float: left !important;
    line-height: 20px !important;
    transform: none !important;
    margin-right: 10px !important;
    position: relative !important;
    top: 3px !important;
  }

  &--together {
    pointer-events: none;
    label::before {
     visibility: hidden;
    }
  }

  &-price-total {
    text-align: right;
    min-width: 100px;
    @include mobile {
      margin-left: auto;

    }
  }
  &-options {
    @include mobile {
      padding-top: 0 !important;
    }
    @include mobile2 {
      width: 100%;
    }
  }

  .vs__search {
    display: none !important;
  }
  &-price {
    margin-left: 10px;
    display: inline-block;
  }


}
</style>