
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER'


const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Đôi lời",
            singer: "Hoàng Dũng",
            path: 'song1.mp3',
            image: 'song1.jpg'
        },
        {
            name: "Gói nắng mang về",
            singer: "Hoàng Dũng",
            path: 'song2.mp3',
            image: 'song2.jpg'
        },
        {
            name: "Nàng thơ",
            singer: "Hoàng Dũng",
            path: 'song3.mp3',
            image: 'song3.jpg'
        },
        {
            name: "Một điều chưa nói",
            singer: "Hoàng Dũng",
            path: 'song4.mp3',
            image: 'song4.jpg'
        },
        {
            name: "Thằng điên",
            singer: "Justatee & Phương Ly",
            path: 'song5.mp3',
            image: 'song5.jpg'
        },
        {
            name: "Đã lỡ yêu em nhiều",
            singer: "Justatee",
            path: 'song6.mp3',
            image: 'song6.jpg'
        },
        {
            name: "Cơn mưa cuối",
            singer: "Justatee & Binz",
            path: 'song7.mp3',
            image: 'song7.jpg'
        },
        {
            name: "Cô nàng khác người",
            singer: "MCK & Pixel & Neko",
            path: 'song8.mp3',
            image: 'song8.jpg'
        },
        {
            name: "Không cần cố",
            singer: "MCK & Pixel & Tlinh",
            path: 'song9.mp3',
            image: 'song9.jpg'
        },
        {
            name: "Chìm sâu",
            singer: "MCK & Trungtran",
            path: 'song10.mp3',
            image: 'song10.jpg'
        }
    ],
    setConFig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" 
                data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
        })
        $('.playlist').innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg'}
        ], {
            duration: 10000, //10s
            iterations: Infinity
        })

        cdThumbAnimate.pause()
        
        // Xử lý phóng tỏ / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }  
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause 
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua bài hát
        progress.oninput = function(e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
         }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            } 
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            } 
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lý Random bật tắt random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConFig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý lặp lại một bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConFig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        // Lắng nghe hành vi click vào playList
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào bài hát
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render()
                }

                // Xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function () {
        setTimeout(function () {
          if ((app.currentIndex === 0, 1)) {
            $(".song.active").scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          } else {
            $(".song.active").scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 300);
      },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()
        
        // Lắng nghe & xử lý các sự kiện (DOM Events)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render Playlist
        this.render();
            
        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', _this.isRandom);
        repeatBtn.classList.toggle('active', _this.isRepeat);
        
    }
}

app.start()