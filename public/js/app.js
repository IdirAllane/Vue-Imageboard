import * as Vue from "./vue.js";
import seeImage from "./components/seeImage.js";

const app = Vue.createApp({
    data() {
        return {
            title: "",
            description: "",
            username: "",
            file: null,
            images: [],
            imgId: null,
            loading: false,
        };
    },

    components: {
        "see-image": seeImage,
    },

    updated() {},
    mounted() {
        fetch("/images.json")
            .then((resp) => resp.json())
            .then((data) => {
                this.images = data;
            })
            .catch((err) => {
                console.log(
                    "something went wrong fetching the json object",
                    err
                );
            });
        this.scroll();

        this.imgId = location.pathname.slice(1);

        window.addEventListener("popstate", () => {
            this.imgId = location.pathname.slice(1);
        });
    },
    methods: {
        selectFile: function (e) {
            this.file = e.target.files[0];
        },
        openCloseImage: function (imgId) {
            this.imgId = imgId;
            imgId === undefined
                ? history.pushState(null, "", `/`)
                : history.pushState(null, "", `/${imgId}`);
        },
        noImage: function (imgId) {
            history.replaceState(null, "", `/`);
            this.imgId = imgId;
        },

        upload: function () {
            const fd = new FormData();

            fd.append("title", this.title);
            fd.append("description", this.description);
            fd.append("username", this.username);
            fd.append("file", this.file);
            this.loading = true;
            fetch("/upload", {
                method: "POST",
                body: fd,
            })
                .then((resp) => resp.json())
                .then((resp) => {
                    this.images.unshift(resp);
                    this.title = "";
                    this.username = "";
                    this.description = "";
                    this.loading = false;
                })
                .catch((err) => console.log("error in upload", err));
        },

        scroll() {
            const imageFetcher = () => {
                let last_id = Math.min.apply(
                    Math,
                    this.images.map((obj) => obj.id)
                );
                if (
                    window.innerHeight + Math.ceil(window.pageYOffset) >=
                    document.body.offsetHeight
                ) {
                    fetch(`/getMoreImages/${last_id}`)
                        .then((resp) => resp.json())
                        .then((data) => {
                            data.map((obj) => this.images.push(obj));
                        })
                        .catch((err) =>
                            console.log("error getting more pictures!", err)
                        );

                    window.removeEventListener("scroll", imageFetcher);

                    setTimeout(() => {
                        window.addEventListener("scroll", imageFetcher);
                    }, 300);
                } else if (this.images[0].lowestId === last_id) {
                    window.removeEventListener("scroll", imageFetcher);
                }
            };

            window.addEventListener("scroll", imageFetcher);
        },
    },
});

app.mount("#main");
