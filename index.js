
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
        //手指滑动是否翻页的阈值 只支持 1/6这种模式
        this.thresholdValue = options.thresholdValue || 1/6

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

        //计算滑动切换阈值
        this.computedThresholdValue = this.fullscreenWidth * this.thresholdValue
        console.log('滚动的阈值：' +  this.computedThresholdValue)
    }

    //绑定dom
    Touchtab.prototype.renderDom = function () {
        //ul列表
        this.outer = document.createElement('ul')
        //数据的长度
        this.dataLen = this.list.length
        console.log(-this.dataLen)

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
        let innerWidthDis = this.fullscreenWidth
        let _this = this 
        //绑定三个触碰的常规事件
        outer.addEventListener('touchstart', startHandle)
        outer.addEventListener('touchmove', moveHandle)
        outer.addEventListener('touchend', endHandle)

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
         //手指滑动的时候   右滑为正数   左滑为负数
        function moveHandle (ev) {
            //禁止滚动事件
            ev.preventDefault()
            //滑动的时候计算偏移量 用于ul的平移
            _this.offsetX = ev.targetTouches[0].pageX - _this.startPageX
            // console.log('滑动的距离：' + _this.offsetX)
            //改变outer的translate3d的x轴的值， translate3d可以启用gpu3d加速
            _this.outer.style.webkitTransform = `translate3d(${_this.initIndex * innerWidthDis + _this.offsetX}px, 0, 0)`
        }
         //手指滑动的时候
        function endHandle (ev) {
            ev.preventDefault()
            //手指离开时候的时间戳  -  触碰时候的时间戳 =   总共花的时间
            let offsetTime = Date.now() - _this.startTime
            /*
                一般这种组件  会考虑到 快速滑动的状况 就是即使距离没达到  切换的阈值  但是手指滑动的速度很快  那么也会切换的、
                一般这个时间差 我们默认用300 ms 那么这时候的阈值会变成  50px 会比较合适
             */
             //快速切换
            if(offsetTime < 300) {
                if(_this.offsetX > 50) {
                    jumpIndex(1)  //整体往右
                }else if(_this.offsetX < -50) {
                    jumpIndex(-1)    //整体往左
                }else {
                    jumpIndex(0)
                }
            //正常切换
            } else {
                if(_this.offsetX >= _this.computedThresholdValue) {
                    jumpIndex(1)
                }else if (_this.offsetX < -_this.computedThresholdValue) {
                    jumpIndex(-1)
                }else {
                    jumpIndex(0)
                }
            }
        }
        //处理切换
        function jumpIndex (n) {
            if(n === -1 && _this.initIndex > -_this.dataLen + 1) {
                _this.initIndex --
            }
            if(n === 1 && _this.initIndex < 0) {
                _this.initIndex ++
            }
             _this.outer.style.webkitTransform = `translate3d(${_this.initIndex * innerWidthDis}px, 0, 0)`
        }
    }
    return Touchtab    
}))