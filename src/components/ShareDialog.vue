<script setup>

import {onMounted, shallowRef, useTemplateRef, watch} from "vue";

const error = shallowRef(null);
const success = shallowRef(null);
const props = defineProps(['url']);

const show = defineModel('show');
const dialogShare = useTemplateRef('dialog_share')
const inpRef = useTemplateRef('inp_ref')


const showShare = shallowRef(false);

onMounted(() => {
  watch(show, (v) => {
    if (v) {
      dialogShare.value.show();
      dialogShare.value.style.display = 'block';
      error.value = null;
      success.value = null;
      inpRef.value.focus();
    } else {
      dialogShare.value.close();
      dialogShare.value.style.display = 'none';
    }
  }, {immediate: true});

  if (navigator.share) {
    showShare.value = true;
  } else {
    showShare.value = false;
  }

});


function close() {
  dialogShare.value.close();
  show.value = false;
}

const copyText = function (textInput) {
  // textInput.focus();
  textInput.select();

  const el = textInput;
  const oldContentEditable = el.contentEditable;
  const oldReadOnly = el.readOnly;
  const range = document.createRange();

  el.contenteditable = true;
  el.readonly = false;
  range.selectNodeContents(el);

  const s = window.getSelection();
  s.removeAllRanges();
  s.addRange(range);

  el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

  el.contentEditable = oldContentEditable;
  el.readOnly = oldReadOnly;

  try {
    document.execCommand('copy');
    return true;
  } catch (e) {
    window.prompt('Copy to clipboard: Ctrl+C', textInput.value);
  }
};

function copy() {
  if (copyText(inpRef.value)) {
    success.value = 'Скопировано в буфер обмена';
  }
}

function share() {
  navigator.share({
    title: window.document.title,
    url: props.url,
  })
      .then(() => console.log('Удалось поделиться'))
      .catch((error) => {
        console.log('Не удалось поделиться', error);
      });
}

</script>

<template>
  <dialog class="callback-form-container calc-add-dialog-share" ref="dialog_share">
    <div class="callback-flex">
      <div class="close-callback" @click="close"></div>
      <p class="form-title">
        <span class="title-2">Ссылка на расчет</span>
      </p>
      <div class="calc-add-dialog-share__msg">
        <div class="calc-error" v-if="error">{{ error }}</div>
        <div class="calc-success" v-if="success">{{ success }}</div>
      </div>
      <input class="calc-add-dialog-share__inp" readonly type="text" v-model="props.url" placeholder="url" ref="inp_ref" autofocus>
      <div class="calc-add-dialog-share__actions">
        <button class="btn" type="button" @click="copy">Копировать</button>
        <button v-if="showShare" class="btn btn--calc-share" type="button" @click="share">Поделится</button>
      </div>
    </div>
  </dialog>
</template>

<style lang="scss">
@use "@/assets/main.scss" as *;
.calc-add-dialog-share {
  display: none;
  padding: 20px;
  &__inp {
    width: 100%;
  }

  &__actions {
    .btn {



      &.btn--calc-share {
        display: none;
      }

    }
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    width: 100%;
    @include mobile {
      display: block;
      .btn {
        display: block;
        margin-bottom: 20px;
        &.btn--calc-share  {
          display: block;
          margin-bottom: 0;
        }
      }
    }
  }

  &__msg {
 //   height: 20px;
  }

}
</style>