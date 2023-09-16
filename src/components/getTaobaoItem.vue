<template>
    <div>
        <n-h2>获取商品数据</n-h2>
        <n-p>使用下列功能时请务必先手动滑动至页面底部，确保描述图完全加载完毕。</n-p>
        <n-form label-placement="left" :label-width="80">
            <n-form-item label="页面名称">
                <n-input v-model:value="productItem.pagename" />
            </n-form-item>
            <n-form-item label="周边价格">
                <n-input v-model:value="productItem.price" />
            </n-form-item>
            <n-form-item label="上架日期">
                <n-date-picker v-model:formatted-value="productItem.date" value-format="yyyy-MM-dd" type="date" clearable
                    style="width: 100%" />
            </n-form-item>
            <n-form-item label="周边主题">
                <n-input v-model:value="productItem.feat" />
            </n-form-item>
            <n-form-item label="下载图片">
                <n-switch v-model:value="productItem.ifImgDownload" />
            </n-form-item>
            <n-form-item label="自动复制">
                <n-switch v-model:value="productItem.ifAutoCopy" />
            </n-form-item>
            <n-form-item>
                <n-button attr-type="button" @click="getTaobaoItem()" :loading="loading">
                    获取
                </n-button>
            </n-form-item>
        </n-form>
        <n-code :code="resCode" show-line-numbers />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import json from '@/json/index.json'
import { GM_download } from 'vite-plugin-monkey/dist/client'
import $ from "jquery/dist/jquery.slim";

let resCode = ref("");
let loading = ref(false);
let productItem = ref({
    pagename: "",
    price: "",
    date: null,
    feat: "",
    ifImgDownload: false,
    ifAutoCopy: false,
});

async function getTaobaoItem() {
    productItem.value.pagename = productItem.value.pagename || "页面名称";
    productItem.value.price =
        productItem.value.price || $("#J_StrPrice>.tb-rmb-num").text();
    let link = `https://item.taobao.com/item.htm?id=${window.g_config.itemId}`;
    let img = window.g_config.idata.item.auctionImages;

    //加载品牌信息
    let brand = window.g_config.shopName in json.Taobao2Brand
        ? json.Taobao2Brand[window.g_config.shopName as keyof typeof json.Taobao2Brand]
        : window.g_config.shopName;

    //加载主题信息
    let series = json["series"];
    let defaultFeat = "";
    series.forEach((element) => {
        if (window.g_config["idata"]["item"]["title"].includes(element)) {
            defaultFeat = element;
        }
    });
    productItem.value.feat = productItem.value.feat || defaultFeat;

    //收集颜色分类的图片
    $("#J_isku .J_TSaleProp a").each((index, ele) => {
        if ($(ele).attr("style")) {
            img = img.concat(
                ($(ele).attr("style") as string)
                    .replace("background:url(", "")
                    .replace("_30x30.jpg) center no-repeat;", "")
            );
        }
    });
    //加上https前缀并去除重复图片
    img.forEach((ele, index) => {
        img[index] = ele.replace(/\/\/gd\d./, "https://gd1.");
    });
    img = Array.from(new Set(img));
    //排序和下载图片
    let imgNameList: string[] = []; //图片的文件名列表
    img.forEach((ele, index) => {
        if (productItem.value.ifImgDownload) {
            GM_download(
                ele,
                productItem.value.pagename + (index + 1) + ele.slice(-4)
            );
        }
        imgNameList = imgNameList.concat(
            productItem.value.pagename + (index + 1) + ele.slice(-4)
        );
    });
    let imgNameStr = imgNameList.join("\n");

    //加载长图
    let longImg: string[] = []; //长图的链接列表
    let longImgList: string[] = []; //长图的文件名列表
    let longImgStr = ""; //长图的文件名字符串

    $("#J_DivItemDesc img").each((index, ele) => {
        let a = $(ele).attr("src");
        if (a) {
            longImg =
                a.slice(0, 4) === "http"
                    ? longImg.concat(a)
                    : longImg.concat("https:" + a);
        } else {
            console.log(`#J_DivItemDesc img src is undefined (${index})`);
        }
    });
    console.log(longImg);

    //排序和下载长图
    longImg.forEach((ele, index) => {
        if (productItem.value.ifImgDownload) {
            GM_download(
                ele,
                productItem.value.pagename +
                " 描述图" +
                (index + 1) +
                ele.slice(-4)
            );
        }
        longImgList = longImgList.concat(
            productItem.value.pagename +
            " 描述图" +
            (index + 1) +
            ele.slice(-4)
        );
    });
    longImgStr = longImgList.join("|");

    //等待长图加载完毕后输出结果
    resCode.value = `{{周边信息\n|版权=\n|尺寸=\n|定价=${productItem.value.price
        }\n|货号=\n|链接（京东）=\n|链接（乐乎市集）=\n|链接（奇货）=\n|链接（淘宝）=${link}\n|链接（天猫）=\n|链接（玩具反斗城）=\n|品牌=${brand}\n|日期=${productItem.value.date || ""
        }\n|适龄=\n|条码=\n|主题=${productItem.value.feat
        }\n}}\n\n<gallery>\n${imgNameStr}\n</gallery>\n\n{{长图|${longImgStr}}}\n`;

    // 如果启用了自动复制，则自动复制结果
    if (productItem.value.ifAutoCopy) {
        navigator.clipboard.writeText(resCode.value);
        alert("复制成功！");
    }
}
</script>