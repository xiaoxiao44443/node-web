/**
 * Created by xiao on 2018/2/16.
 */

class DragHelper {
    constructor({ onDragStart, onDragMove, onDragEnd }) {
        this.dragStartCallBack = typeof onDragStart == 'function' ? onDragStart : () => {};
        this.moveCallBack = typeof onDragMove == 'function' ? onDragMove : () => {};
        this.dragEndCallBack = typeof onDragEnd == 'function' ? onDragEnd : () => {};
    };
    start = {
        offsetX: 0,
        offsetY: 0
    };
    touch = false;
    mouseDown = false;
    draggingIndex = 0; //鼠标弹起计数器
    target = null;
    lastMovePos = false;
    recordStart = touch => {
        const target = this.target;
        this.start = {
            offsetX: touch.clientX - target.offsetLeft,
            offsetY: touch.clientY - target.offsetTop
        };
        this.dragStartCallBack();
    };
    moveCalc = touch => {
        const start = this.start;
        const target = this.target;
        let x = touch.clientX - start.offsetX;
        let y = touch.clientY - start.offsetY;
        let w = target.offsetWidth;
        let h = target.offsetHeight;
        this.lastMovePos = { x, y, w, h };
        this.moveCallBack({
            x, y, w, h
        });
    };
    onMouseMove = e => {
        if (!this.mouseDown) return;
        const start = this.start;
        if (!start) return;
        if (e.cancelable) {
            // 判断默认行为是否已经被禁用
            if (!e.defaultPrevented) {
                e.preventDefault();
            }
        }
        this.draggingIndex = 2; //鼠标弹起，用来判断是否触发click
        this.moveCalc(e, e.target);
    };
    onMouseUp =  e => {
        this.removeEventListener();
        this.dragEnd();
    };
    removeEventListener = () => {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    };
    dragEnd = () => {
        this.start = false;
        this.touch = false;
        this.mouseDown = false;
        this.target = null;
        this.dragEndCallBack(this.lastMovePos);
        this.lastMovePos = false;
    };
    props = {
        onMouseDown: e => {
            this.mouseDown = true;
            this.draggingIndex = 1;
            this.target = e.target;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
            this.recordStart(e);
        },
        onMouseUp: e => {
            this.draggingIndex = this.draggingIndex - 1;
            e.preventDefault();
            this.dragEnd();
            this.removeEventListener();
        },
        onTouchStart: e => {
            this.target = e.target;
            this.recordStart(e.targetTouches[0]);
        },
        onTouchMove: e => {
            const start = this.start;
            if (!start) return;
            if (e.cancelable) {
                // 判断默认行为是否已经被禁用
                if (!e.defaultPrevented) {
                    e.preventDefault();
                }
            }
            this.moveCalc(e.targetTouches[0], e.target);
        },
        onTouchEnd: () => {
            this.dragEnd();
        }
    };
}

export default DragHelper;