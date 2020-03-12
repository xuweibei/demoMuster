import React from 'react';
import { Upload, Icon, message, Modal, Button } from 'antd';
import { env } from '@/api/env';
//pathType:可配置
//callback:fun(value)
class FileUploader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            enableUpload: true,
        };
    }
    componentWillReceiveProps(nextProps) {
        // Should be a controlled component.
        if ('value' in nextProps) {
            const value = nextProps.value;
        }
    }
    triggerChange = (changedValue) => {
        // Should provide an event to pass value to Form.
        const onChange = this.props.onChange;
        if (onChange) {
            onChange(changedValue);
        }
        if (this.props.callback) {
            this.props.callback(changedValue)
        }
    }
    handleChange = (info) => {
        if (info.file.status === 'done') {
            if (info.file.response.state !== 'success') {
                message.error(info.file.response.msg);
            }
            else {
                //上传后不能继续删除
                this.setState({ enableUpload: false })
                this.triggerChange(info.file.response.data[0]);//上传回调
            }
        }
    }
    handlerRemove = (info) => {
        //删除后可以上传
        this.setState({ enableUpload: true })
    }
    render() {
        let token = env.getToken();
        let uploadUrl = `${env.serverURL}/edu/file/uploadFile?token=${token}&pathType=${this.props.pathType || ''}`;
        return (
            <div className="FileUploader">
                <Upload
                    name="files"
                    showUploadList={true}
                    action={uploadUrl}
                    onChange={this.handleChange}
                    onRemove={this.handlerRemove}
                    multiple={false}
                >
                    {this.state.enableUpload && <Button>
                        <Icon type="upload" />上传文件
                    </Button>
                    }
                </Upload>
            </div>
        );
    }
}


export default FileUploader;