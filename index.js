
;(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(global, global.document);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document);
    } else {
        global.Touchtab = factory(global, global.document);
    }
}(typeof window !== 'undefined' ? window : this, function (window, document) {

    function Touchtab (options) {
        //外层的容器dom
        this.wrap = options.wrap
        //图片的列表  一般是ajax
        this.list = options.list

        this.init()
        this.renderDom()
        this.touchEvent()
    }
    //初始化一些信息
    Touchtab.prototype.init = function () {
        //浏览器屏幕的宽度
        this.fullscreenWidth = document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth
        //初始的索引
        this.initIndex = 0
    }

    //绑定dom
    Touchtab.prototype.renderDom = function () {
        //ul列表
        this.outer = document.createElement('ul')
        //数据的长度
        this.dataLen = this.list.length

        var screenW = this.fullscreenWidth
        for(var i = 0; i < this.dataLen; i++) {
            var sonDate = document.createElement('li') 
            var dataItem = this.list[i]
            sonDate.style.width = this.fullscreenWidth + 'px'           

            if(dataItem) {
                sonDate.innerHTML = '<img width="'+screenW+'" src="'+dataItem+'"></img>'
            }
            this.outer.appendChild(sonDate)
        }
        this.outer.style.width = this.fullscreenWidth * this.dataLen + 'px'
        this.outer.className = 'outer'
        this.wrap.appendChild(this.outer)
    }

    //触摸的事件
    Touchtab.prototype.touchEvent = function () {
        let outer = this.outer
        let _this = this 
        //绑定三个触碰的常规事件
        outer.addEventListener('touchstart', startHandle)
        outer.addEventListener('touchmove', moveHandle)
        outer.addEventListener('touchmove', endHandle)

        //手指触碰的时候
        function startHandle (ev) {
            //触碰的时候的时间戳
            _this.startTime = Date.now()
            //触碰的手指的pageX坐标
            _this.startPageX = ev.touches[0].pageX 
            //初始化的偏移量
            _this.offsetX = 0

            //让触碰的元素始终都为  UL  因为ev.target代表的是 当前触碰到的元素 很可能是子元素 所以要进行处理  必须改成父元素UL
            let touchTarget = ev.target
            while (touchTarget.nodeName !== 'UL' && touchTarget.nodeName !== 'BODY') {
                touchTarget = touchTarget.parentNode
            }
            _this.target = touchTarget
        }
         //手指滑动的时候
        function moveHandle (ev) {
            //禁止滚动事件
            ev.preventDefault()
            //滑动的时候计算偏移量 用于ul的平移
            _this.offsetX = ev.targetTouches[0].pageX - _this.startPageX
            //改变outer的translate3d的x轴的值， translate3d可以启用gpu3d加速
            _this.outer.style.webkitTransform = `translate3d(${_this.offsetX}px, 0, 0)`
        }
         //手指滑动的时候
        function endHandle (ev) {
            
        }
    }
    return Touchtab    
}))