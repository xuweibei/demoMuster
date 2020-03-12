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
            type: props.type,
            fileList: []
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

        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        this.setState({ fileList });

        if(fileList.length){

            this.props.onUploadFile(false);
        
            if (info.file.status === 'done') {
                this.props.onUploadFile(true);
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
        
    }
    handlerRemove = (info) => {
        //删除后可以上传
        this.props.onUploadFile(true);
        this.setState({ enableUpload: true })
    }

    beforeUpload=(file, fileList) => {

        let name = file.name;
        let nameArr = name.split(".");
        let fileType = nameArr[nameArr.length-1].toLowerCase();
        let re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则

        // if(name.match(re) && name.match(re).length){
        //     message.error('文件名含有中文，修改后再上传！');
        //     this.setState(({ fileList }) => ({
        //       fileList: [],
        //     }));
        //     return false;
        // }
        
        if(this.state.type == 'pic'){
            // 检查图片类型
            // 只能上传三种图片格式
            const isJPG = file.type === 'image/jpeg';
            const isPNG = file.type === 'image/png';
            const isBMP = file.type === 'image/bmp';
            const isGIF = file.type === 'image/gif';
            const isWEBP = file.type === 'image/webp';
            const isPic = isJPG || isPNG || isBMP || isGIF || isWEBP;
            
            if (!isPic) {
              message.error('格式有误！请上传正确的图片格式！');
              this.props.onUploadFile(true);
              this.setState({ fileList: [] });
              return false;
            }
            
            return isPic;
        }else{

            const isZIP = fileType === 'zip';
            const isRAR = fileType === 'rar';
            const isPDF = fileType === 'pdf';
            const isPackage = isZIP || isRAR || isPDF;

            if(!isPackage){
                message.error('格式有误！请上传rar/zip/pdf格式的文件！');
                this.props.onUploadFile(true);
                this.setState({ fileList: [] });
                return false;
            }
            
            return isPackage;
        }
        
    };

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
                    beforeUpload={this.beforeUpload}
                    fileList={this.state.fileList}
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