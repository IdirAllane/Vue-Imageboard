import seeComments from "./seeComments.js";

const seeImage = {
    data() {
        return {
            images: [],
            showLeft: true,
            showRight: true,
            date: "",
        };
    },
    props: ["imageId"],
    components: {
        "see-comments": seeComments,
    },
    watch: {
        imageId: function () {
            this.fetchImages();
            this.showPrevNextButtons();
        },
    },

    mounted() {
        this.fetchImages();
    },

    methods: {
        closeImage: function () {
            this.$emit("close");
        },
        imgNotFound: function () {
            this.$emit("noimage");
        },

        fetchImages: function () {
            fetch(`/showImages/${this.imageId}`)
                .then((resp) => resp.json())
                .then((data) => {
                    data.length === 0
                        ? this.imgNotFound()
                        : (this.images = data);
                    this.showPrevNextButtons();
                    this.date = this.polishDate(this.images[0].created_at);
                })
                .catch((err) => {
                    console.log(
                        "something went wrong fetching the json object",
                        err
                    );
                    this.imgNotFound();
                });
        },

        switchImages: function (e) {
            e.target.id === "goLeft"
                ? this.$emit("switchimages", this.images[0].prevId)
                : this.$emit("switchimages", this.images[0].nextId);
        },

        showPrevNextButtons: function () {
            this.images[0].prevId === null
                ? (this.showLeft = false)
                : (this.showLeft = true);
            this.images[0].nextId === null
                ? (this.showRight = false)
                : (this.showRight = true);
        },
        polishDate: function (date) {
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mai",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];

            return date
                .slice(0, 16)
                .replace(date.slice(4, 8), `-${months[date.slice(6, 7)]}-`)
                .replace("T", " at ");
        },
    },

    template: `
      <div id="image_component"  v-for="img in images" :key="img.id" @click.self="closeImage">
                <p id="closeImg" @click.self="closeImage" > x </p>

                <button id="goLeft" @click="switchImages" :style="{visibility: showLeft? 'visible' : 'hidden'}"> ᐊ  </button>

                <div id="contentbox"> 
                        <div class="contentbox_img">
                         <img :src=img.url :alt=img.description>
                         </div>
                            <div id="image_information">
                                <h1>{{img.title}}</h1>
                                <h2 id="img_description">{{img.description}}</h2>
                                
                                <div id="user_time">
                                <p>@{{img.username}}</p>
                                <p id="timestamp">{{date}}</p>
                                </div>
                            </div>
                            
                            <see-comments :image-id="imageId"></see-comments>
                         
                        
                </div>
                <button id="goRight" @click="switchImages" :style="{visibility: showRight? 'visible' : 'hidden'}"> ᐅ </button>        
    </div>   
    `,
};

export default seeImage;
