/*
导入
*/
import React from 'react';
import { connect } from 'react-redux';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload } from 'antd';
const FormItem = Form.Item;

import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';

import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24
} from '@/utils/componentExt';
import FileDownloader from '@/components/FileDownloader';


const formItemLayout24 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};


class GradeImport extends React.Component {
  constructor(props){
    super(props);
    this.state= {
      editMode: '',
      loading: false,
      pagingSearch: props.currentDataModel,

      uploading: false,
      fileList: [],

      isImported: false,
      successCount: 0,
      errorCount: 0,
      errorJsonStr: '',
      error_url: ''
    };
    this.onSearch = onSearch.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    (this: any).onSave = this.onSave.bind(this);
  }
  componentWillMount(){
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  onSave = () => {
    var that = this;
    const { fileList } = this.state;
    const formData = new FormData();
    //fileList.forEach((file) => {
    //  formData.append('files[]', file);
    //});
    if(!fileList.length){
      message.error("请上传一个文件");
      return;
    }
    let token = env.getToken();
    formData.append('file', fileList[0]);
    formData.append('token', token);

    this.setState({
      uploading: true,
      isImported: false
    });

    this.setState({
      fileList: [],
    });

    const successFn = (response) => {
      console.log(xhr.responseText);
      var data = eval('(' + xhr.responseText + ')');
      if (data.state == 'success') {
        // 假设服务端直接返回文件上传后的地址
        // 上传成功后调用param.success并传入上传后的文件地址
        //var _str = JSON.stringify(data.data.error);
        //var str = data.data.error.length ? encodeURI(_str) : "";
        
        if(typeof data.data == 'number'){
          that.setState({
            isImported: true,
            successCount: data.data,
            errorCount: 0,
            error_url: `/edu/returnVisitStudent/exportFalseList`,
          })
        }else{
          that.setState({
            isImported: true,
            successCount: data.data.successCount,
            errorCount: data.data.falseCount,
            errorJsonObj: data.data.error,
            error_url: `/edu/returnVisitStudent/exportFalseList`,
          })
        }
        
        //param.success({
        //  url: data.data.fullUrl
        //})
      }
      else {
        //param.error({ msg: data.message });
        message.error(data.msg);
      }
    }

    const progressFn = (event) => {
      // 上传进度发生变化时调用param.progress
      //param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      message.error('上传失败!');
    }

    let uploadUrl = `${env.serverURL}/edu/returnVisitStudent/importReturnVisit?token=${token}`;
    const xhr = new XMLHttpRequest
    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)
    xhr.open('POST', uploadUrl, true)
    //xhr.responseType
    xhr.send(formData)

  }

  render(){
    const { uploading } = this.state;
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        return false;
      },
      fileList: this.state.fileList,
      multiple: false
    };

    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
        default:
        block_content = (
          <div>
            <Form className="ant-advanced-search-form" enctype="multipart/form-data" method="post">
              <Row gutter={24}>
                
                <Col span={24}>
                  <FormItem {...searchFormItemLayout24} label="下载">点击&nbsp;
                    {/*<a onClick={() => { window.open('') }}>下载上传模板</a>*/}
                    <FileDownloader
                      apiUrl={'/edu/file/getFile'}//api下载地址
                      method={'post'}//提交方式
                      options={{ filePath: 'upload/importTemplate/visitMessageUpload.xlsx' }}
                      title={'下载模板'}
                    >
                    </FileDownloader>
                    &nbsp;&nbsp;整理 项目回访任务下，您负责学生的回访信息，同一任务同一回访日期只能存在一条回访信息。
                  </FormItem>
                </Col>

                <Col span={12}>
                  <FormItem {...formItemLayout24} label='选择上传文档'>
                    <Upload {...props}>
                      <Button>
                        <Icon type="upload" /> 选择文件上传
                      </Button>
                    </Upload>
                  </FormItem>
                </Col>
                {
                  this.state.isImported &&
                  <Col span={24}>
                    成功导入{this.state.successCount}条。导入失败{this.state.errorCount}条。
                    {this.state.errorCount ?
                        <FileDownloader
                          apiUrl={this.state.error_url}//api下载地址
                          method={'post'}//提交方式
                          //options={'token': env.getToken()}//提交参数
                          title={'导出错误记录'}
                        />
                        : ''
                    }
                  </Col>
                }
              </Row>
            </Form>
          </div>
        )
        break;
    }
    return (
      <ContentBox titleName={"学生回访任务导入"} bottomButton={
        <FormItem
          className='btnControl'
          {...btnformItemLayout}
        >
          <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSave}>上传</Button>
          <span className="split_button"></span>
          <Button icon="rollback" onClick={this.onCancel} >返回</Button>
        </FormItem>
      }>
        <div className="dv_split"></div>
        {block_content}
        <div className="dv_split"></div>
      </ContentBox>
    )
  }
}
//表单组件 封装
const WrappedManage = Form.create()(GradeImport);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
      //courseArrangeImport: bindActionCreators(courseArrangeImport, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
