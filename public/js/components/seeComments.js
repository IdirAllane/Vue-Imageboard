const seeComments = {
    data() {
        return {
            comments: [],
            username: "",
            comment: "",
            nocomment: true,
        };
    },
    props: ["image-id"],

    watch: {
        imageId: function () {
            this.getComments();
            this.noComments();
        },
    },

    mounted() {
        this.getComments();
    },

    methods: {
        getComments: function () {
            fetch(`/get-comments/${this.imageId}`)
                .then((resp) => resp.json())
                .then((data) => {
                    this.comments = data;
                    this.noComments();
                })
                .catch((err) => console.log("error in posting comment!", err));
        },
        postComment: function () {
            let date = new Date();
            let newDate = date.toLocaleString("en-US", {
                day: "numeric",
                year: "numeric",
                month: "long",
                hour: "numeric",
                minute: "numeric",
            });
            const reqBody = {
                img_id: this.imageId,
                username: this.username,
                comment: this.comment,
                timestamp: newDate,
            };

            fetch(`/postComment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reqBody),
            })
                .then((resp) => resp.json())
                .then((data) => {
                    this.comments.unshift(data);
                    this.noComments();
                    this.username = "";
                    this.comment = "";
                })
                .catch((err) => console.log("error posting comment!", err));
        },
        noComments: function () {
            this.comments.length === 0
                ? (this.nocomment = true)
                : (this.nocomment = false);
        },
    },
    template: `

     <div  id="comment_section">
     <p id="no_comments" v-if="nocomment"> no comments here yet...</p>
        <div v-for="com in comments" :key="com.id" class="single_comment">
            <p>{{com.comment}}</p>
            <div class="user_time_in_comment">
            <p>@{{com.username}}</p>
            <p>{{com.created_at}}</p>
            </div>
        </div>
     </div>
       <div id="comment_form" >                   
            <form id="comment_grid">
                <input v-model="comment" type="text" name="comment" placeholder="comment" class="comment_input">
                <input v-model="username" type="text" name="username" placeholder="username" class="comment_input">
                <button @click.prevent.default="postComment" id="post_comment"> 
                post ⬆
                </button>
            </form>               
        </div>             

    `,
};

export default seeComments;
