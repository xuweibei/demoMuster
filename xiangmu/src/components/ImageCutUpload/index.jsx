import React from 'react';
import { Slider, Button, Icon } from 'antd';
import AvatarEditor from 'react-avatar-editor'
import './index.less'

class ImageCutUpload extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            previewUrl: this.props.value || null,
            scale: 1.2,
            rotate: 0,
            width: this.props.width || 300,
            height: this.props.height || 300,
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value;
            //this.setState({ imageUrl: value });
        }
    }
    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
    }

    onFileChange = (evt) => {
        const reader = new FileReader();
        var that = this;
        reader.addEventListener('load', function () {
            that.setState({
                image: reader.result
            });
            setTimeout(()=>{
                that.onCut()
            }, 1000);
        });
        reader.readAsDataURL(evt.target.files[0]);
    }

    clear = () => {
        this.setState({
            image: null,
            value: ''
        })
    }
    onScaleChange = (value) => {
        this.setState({ scale: value });
        this.onCut();
    }
    onRotateChange = (value) => {
        var currentRotate = this.state.rotate + (value);
        if (currentRotate < 0) {
            currentRotate = 360 + currentRotate;
        }
        if (currentRotate > 360 || currentRotate < 0) {
            currentRotate = 0;
        }
        this.setState({ rotate: currentRotate })
        this.onCut();
    }
    setEditorRef = (editor) => this.editor = editor

    onCut = () => {
        if (this.editor) {
            // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
            // drawn on another canvas, or added to the DOM.
            const canvas = this.editor.getImageScaledToCanvas();
            var cutImage = canvas.toDataURL('image/jpeg')
            this.triggerChange(cutImage)
        }
    }
    switchAdvControl = () => {
        this.setState({ showAdvControl: !(this.state.showAdvControl || false) });
    }
    render() {
        var defaultImageStyle = { width: 300, height: 300 * this.state.height / this.state.width };
        return (
            <div className='avatar-photo'>
                {!this.state.image && <input ref='file' type='file' accept="image/jpg,image/jpeg,image/png,image/bmp" onChange={this.onFileChange} />}
                {
                    this.state.image &&
                    <div>
                        <AvatarEditor
                            ref={this.setEditorRef}
                            image={this.state.image}
                            width={this.state.width}
                            height={this.state.height}
                            border={50}
                            color={[0, 0, 0, 0.6]} // RGBA
                            scale={this.state.scale}
                            rotate={this.state.rotate}
                            onImageChange={this.onCut}
                            onPositionChange={this.onCut}
                        />
                        {
                            this.state.showAdvControl && <div>
                                图片缩放:<Slider step={0.1} value={this.state.scale} min={1} max={2.5} onChange={this.onScaleChange} />
                                图片旋转:<br />
                                <Button style={{ marginRight: 10 }} onClick={() => { this.onRotateChange(-90) }}>向左旋转</Button>
                                <Button style={{ marginRight: 10 }} onClick={() => { this.onRotateChange(90) }}>向右旋转</Button>
                                <br />
                            </div>
                        }
                        剪裁控制:<br />
                        <Button style={{ marginRight: 10 }} onClick={this.switchAdvControl}>{this.state.showAdvControl ? '隐藏' : '显示'}高级设置</Button><Button style={{ marginRight: 10 }} onClick={this.clear}>重新上传</Button>
                    </div>
                }
                {
                    (!this.state.image && this.state.previewUrl) &&
                    <img src={this.state.previewUrl} style={defaultImageStyle} />
                }
                {
                    (!this.state.image && !this.state.previewUrl) &&
                    <div style={{ ...defaultImageStyle, border: 'dashed 1px #ccc' }} >
                        <Icon type="plus" className="avatar-uploader-trigger" style={defaultImageStyle} />
                    </div>
                }
            </div>
        );
    }
}


export default ImageCutUpload;