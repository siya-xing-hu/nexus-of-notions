<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8">
    <!-- Key Management Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        SM2 密钥对
      </h2>
      <div class="flex items-center space-x-4 mb-6">
        <button
          @click="generateKeys"
          :disabled="isGenerating"
          class="self-end inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          <span v-if="isGenerating">生成中...</span>
          <span v-else>生成密钥</span>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="flex justify-between items-center mb-2">
            <label
              for="public-key"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >公钥</label
            >
            <button
              @click="copyToClipboard(showPublicKey)"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4" />
            </button>
          </div>
          <div class="flex items-center space-x-1 ml-1">
            <button
              @click="convertPublicKey('Raw')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              裸公钥
            </button>
            <button
              @click="convertPublicKey('Compressed')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              压缩公钥
            </button>
            <button
              @click="convertPublicKey('Base64')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Base64
            </button>
            <button
              @click="convertPublicKey('StandardPEM')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              公钥 PEM
            </button>
            <button
              @click="convertPublicKey('CertPEM')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              证书 PEM
            </button>
          </div>
          <textarea
            id="public-key"
            v-model="showPublicKey"
            rows="9"
            placeholder="用于加密"
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label
              for="private-key"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >私钥</label
            >
            <button
              @click="copyToClipboard(showPrivateKey)"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4" />
            </button>
          </div>
          <div class="flex items-center space-x-1 ml-1">
            <button
              @click="convertPrivateKey('Raw')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              裸私钥
            </button>
            <button
              @click="convertPrivateKey('Base64')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Base64
            </button>
            <button
              @click="convertPrivateKey('PEM')"
              class="border-t border-l border-r w-18 border-gray-300 p-0.5 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              PEM (EC)
            </button>
          </div>
          <textarea
            id="private-key"
            v-model="showPrivateKey"
            rows="9"
            placeholder="用于解密"
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Crypto Conversion Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        实时加解密
      </h2>
      <div class="flex items-center justify-center space-x-4">
        <!-- Plaintext -->
        <div class="w-full">
          <label
            for="plaintext"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >加密前文本</label
          >
          <textarea
            id="plaintext"
            v-model="inputText"
            @paste="handleEncrypt"
            @blur="handleEncrypt"
            rows="10"
            placeholder="在此输入待加密文本"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
        <!-- Conversion Icon & Mode Selector -->
        <div class="flex-shrink-0 px-2 flex flex-col items-center space-y-2">
          <div class="w-auto">
            <label
              for="cipher-mode"
              class="block text-xs font-medium text-gray-700 dark:text-gray-300 text-center"
              >加密模式</label
            >
            <select
              id="cipher-mode"
              v-model="cipherMode"
              class="mt-1 block border w-full py-2 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="1">C1C2C3</option>
              <option value="0">C1C3C2</option>
            </select>
          </div>
          <Icon
            v-if="!isProcessing"
            name="mdi:arrow-left-right"
            class="w-8 h-8 text-gray-400 dark:text-gray-500"
          />
          <Icon
            v-else
            name="eos-icons:loading"
            class="w-8 h-8 text-indigo-500"
          />
        </div>
        <!-- Ciphertext -->
        <div class="w-full">
          <label
            for="ciphertext"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >加密后文本</label
          >
          <textarea
            id="ciphertext"
            v-model="resultText"
            @paste="handleDecrypt"
            @blur="handleDecrypt"
            rows="10"
            placeholder="在此输入加密后文本"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
      </div>
    </div>

    <div
      v-if="showToast"
      class="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg"
    >
      复制成功!
    </div>

    <!-- 描述 -->
    <div class="mt-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        格式说明
      </h3>
      <ul
        class="space-y-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside"
      >
        <li>
          <strong>裸公钥 (Raw):</strong>
          最原始格式，由 `04` + X坐标 + Y坐标 组成，共65字节。
        </li>
        <li>
          <strong>公钥 PEM (Standard):</strong>
          最常见交互格式。是“裸公钥”经过ASN.1包装和Base64编码后的文本形式。
        </li>
        <li>
          <strong>压缩公钥:</strong>
          为节省空间，仅保留X坐标和Y的奇偶性（前缀`02`或`03`）。共33字节。
        </li>
        <li>
          <strong>证书 PEM:</strong>
          最常用的证书交换格式，是证书DER的Base64编码文本形式。
        </li>
        <li>
          <strong>PEM(EC):</strong>
          将私钥转换为符合 SEC1 标准的 PEM 格式，其中包含公钥信息。
        </li>
        <li>
          <strong>Base64:</strong> 将二进制数据转换为可打印的 ASCII 字符字符串。
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { sm2 } from "sm-crypto-v2";
import { showGlobalError } from "@/lib/api";

// State
const isGenerating = ref(false);
const publicKey = ref("");
const showPublicKey = ref("");
const privateKey = ref("");
const showPrivateKey = ref("");
const inputText = ref("");
const resultText = ref("");
const isProcessing = ref(false);
const showToast = ref(false);
const cipherMode = ref("1"); // '1' for C1C2C3, '0' for C1C3C2
let debounceTimer: NodeJS.Timeout | null = null;

// Methods
const generateKeys = async () => {
  isGenerating.value = true;
  await new Promise((resolve) => setTimeout(resolve, 50));
  try {
    const keypair = sm2.generateKeyPairHex();
    privateKey.value = keypair.privateKey;
    showPrivateKey.value = keypair.privateKey;
    publicKey.value = keypair.publicKey;
    showPublicKey.value = keypair.publicKey;
  } catch (error) {
    console.error("密钥生成失败:", error);
  } finally {
    isGenerating.value = false;
  }
};

const handleEncrypt = () => {
  if (!inputText.value) {
    resultText.value = "";
    return;
  }
  debounceProcess(performEncrypt);
};

const handleDecrypt = () => {
  if (!resultText.value) {
    inputText.value = "";
    return;
  }
  debounceProcess(performDecrypt);
};

const debounceProcess = (func: () => void) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    func();
  }, 500); // 500ms debounce
};

const performEncrypt = () => {
  isProcessing.value = true;
  resultText.value = "";
  if (!publicKey.value || !inputText.value) {
    showGlobalError("公钥和待加密文本不能为空。");
    isProcessing.value = false;
    return;
  }
  try {
    resultText.value = sm2.doEncrypt(
      inputText.value,
      publicKey.value,
      parseInt(cipherMode.value, 10),
      {
        asn1: true,
      }
    );
  } catch (e: any) {
    showGlobalError("加密操作失败: " + e.message);
  } finally {
    isProcessing.value = false;
  }
};

const performDecrypt = () => {
  if (!privateKey.value) {
    showGlobalError("请先生成或提供私钥。");
    return;
  }
  isProcessing.value = true;
  try {
    const decrypted = sm2.doDecrypt(
      resultText.value,
      privateKey.value,
      parseInt(cipherMode.value, 10),
      {
        asn1: false,
      }
    );
    if (decrypted === false) {
      throw new Error("解密失败，请检查私钥或密文。");
    }
    inputText.value = decrypted;
  } catch (e: any) {
    showGlobalError("解密操作失败: " + e.message);
  } finally {
    isProcessing.value = false;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  });
};

const convertPrivateKey = (type: string) => {
  if (!privateKey.value) {
    showGlobalError("请先生成私钥。");
    return;
  }

  let convertedKey = "";
  const privateKeyHex = privateKey.value;

  switch (type) {
    case "Raw":
      convertedKey = privateKeyHex;
      break;
    case "Base64": {
      const bytes = [];
      for (let i = 0; i < privateKeyHex.length; i += 2) {
        bytes.push(parseInt(privateKeyHex.substring(i, i + 2), 16));
      }
      convertedKey = btoa(String.fromCharCode(...bytes));
      break;
    }
    case "PEM": {
      const version = "020101"; // INTEGER 1
      const privKeyOctet = "0420" + privateKeyHex; // OCTET STRING (32 bytes)
      // BIT STRING, plus 00 for unused bits, containing the uncompressed public key
      const pubKeyBitString = "034200" + publicKey.value;
      // CONTEXT-SPECIFIC TAG [1] for the public key
      const pubKeyTagged = "a144" + pubKeyBitString;

      const innerSequenceContent = version + privKeyOctet + pubKeyTagged;
      const innerSequenceHeader =
        "30" + (innerSequenceContent.length / 2).toString(16).padStart(2, "0");

      const derHex = innerSequenceHeader + innerSequenceContent;

      const bytes = [];
      for (let i = 0; i < derHex.length; i += 2) {
        bytes.push(parseInt(derHex.substring(i, i + 2), 16));
      }
      const base64 = btoa(String.fromCharCode(...bytes));
      const pemBody = base64.match(/.{1,64}/g)?.join("\n") || base64;
      convertedKey = `-----BEGIN EC PRIVATE KEY-----\n${pemBody}\n-----END EC PRIVATE KEY-----`;
      break;
    }
    default:
      throw new Error("不支持的私钥格式");
  }
  showPrivateKey.value = convertedKey;
};

// 转换公钥格式
const convertPublicKey = (type: string) => {
  if (!publicKey.value) {
    showGlobalError("请先生成公钥。");
    return;
  }

  let convertedKey = "";
  const uncompressedHex = publicKey.value;

  switch (type) {
    case "Raw":
      convertedKey = publicKey.value;
      break;
    case "Compressed":
      convertedKey = sm2.compressPublicKeyHex(uncompressedHex);
      break;
    case "Base64":
      const bytes = [];
      for (let i = 0; i < uncompressedHex.length; i += 2) {
        bytes.push(parseInt(uncompressedHex.substring(i, i + 2), 16));
      }
      convertedKey = btoa(String.fromCharCode(...bytes));
      break;
    case "StandardPEM": {
      const asn1Prefix = "3059301306072a8648ce3d020106082a811ccf5501822d034200";
      const derHex = asn1Prefix + uncompressedHex;
      const bytes = [];
      for (let i = 0; i < derHex.length; i += 2) {
        bytes.push(parseInt(derHex.substring(i, i + 2), 16));
      }
      const base64 = btoa(String.fromCharCode(...bytes));
      const pemBody = base64.match(/.{1,64}/g)?.join("\n") || base64;
      convertedKey = `-----BEGIN PUBLIC KEY-----\n${pemBody}\n-----END PUBLIC KEY-----`;
      break;
    }
    case "CertPEM":
      convertedKey = "";
      break;
    default:
      throw new Error("不支持的公钥格式");
  }

  showPublicKey.value = convertedKey;
};
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200;
}
</style>
