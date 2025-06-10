<script setup>

import {onMounted, shallowRef, useTemplateRef, watch} from "vue";
import {urlProduct} from "@/helpers.js";

const article = shallowRef(null);
const error = shallowRef(null);

const show = defineModel('show');
const emit = defineEmits(['add'])
const dialogAdd = useTemplateRef('dialog_add')
const inpRef = useTemplateRef('inp_ref')

onMounted(()=>{
  watch(show, (v)=>{
    if (v) {
      dialogAdd.value.show();
      dialogAdd.value.style.display = 'block';
      error.value=null;
      article.value=null;
      inpRef.value.focus();
    } else {
      dialogAdd.value.close();
      dialogAdd.value.style.display = 'none';
    }
  }, {immediate: true});

});





async function addProduct() {
  error.value='';

  if (article.value.trim() !== '') {
    try {
      const p = await fetch(urlProduct + '?article=' + encodeURIComponent(article.value.trim())).then(async (res) => {
        console.log(res);
        if (!res.ok) {
          throw new Error((await res.json()).error || 'error');
        }
        return res.json();
      });
      emit('add', p);
    } catch (e) {

      error.value=e.message || 'error';
    }
  } else {
    dialogAdd.value.focus()
  }
}
function close() {
  dialogAdd.value.close();
  show.value = false;
}


</script>

<template>
  <dialog class="callback-form-container calc-add" ref="dialog_add">
    <div class="callback-flex">
      <div class="close-callback" @click="close"> </div>
      <p class="form-title">
        <span class="title-2">Добавить товар</span>
      </p>
      <div class="calc-error" v-if="error"  >{{error}}</div>
      <form @submit.prevent="addProduct">
        <input type="text" v-model="article" placeholder="Артикул" ref="inp_ref" required autofocus >
        <button class="btn" type="submit" name="submit" >Добавить</button>
      </form>
    </div>
  </dialog>
</template>

<style  lang="scss">
.calc-add {
  display: none;
  form {
    display: flex;
    flex-direction: column;
  }
}
</style>