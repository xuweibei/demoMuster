/*
课表导入管理 导入
2018-05-21
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload } from 'antd';
const FormItem = Form.Item;

import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout
} from '@/utils/componentExt';
import FileDownloader from '@/components/FileDownloader';

import { loadDictionary } from '@/actions/dic';
//import { courseArrangeImport } from '@/actions/course';
const formItemLayout24 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

/*
var axios = require('axios');
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
const apiClient = axios.create()

apiClient.interceptors.request.use(config => {
  //config.headers['Content-Type'] = 'application/json; charset=UTF-8'
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})*/

class CourseArrangeImportPage extends React.Component {
  constructor(props){
    super(props);
    this.state= {
      editMode: '',
      loading: false,
      pagingSearch: props.pagingSearch,

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
    (this: any).onExport = this.onExport.bind(this);
  }
  componentWillMount(){
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onExport = () => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest;
    var url = `${env.serverURL}/edu/courseArrangeImport/exportsErrCourse?token=${env.getToken()}`;
    xhr.open('POST', url, true)
    xhr.send(formData)
  }
  onSave = () => {
    var that = this;
    this.props.form.validateFields((err, values) => {

      if (!err) {

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
        formData.append('itemId', this.state.pagingSearch.itemId);
        formData.append('courseplanBatchId', this.state.pagingSearch.courseplanBatchId);
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
            that.setState({
              isImported: true,
              successCount: data.data.successCount,
              errorCount: data.data.errCount,
              errorJsonObj: data.data.error,
              error_url: `/edu/courseArrangeImport/exportsErrCourse`,
            })
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

        let uploadUrl = `${env.serverURL}/edu/courseArrangeImport/importCourseExcel?token=${token}`;
        const xhr = new XMLHttpRequest
        xhr.upload.addEventListener("progress", progressFn, false)
        xhr.addEventListener("load", successFn, false)
        xhr.addEventListener("error", errorFn, false)
        xhr.addEventListener("abort", errorFn, false)
        xhr.open('POST', uploadUrl, true)
        //xhr.responseType
        xhr.send(formData)


        /*axios({
            url: `${env.serverURL}/edu/courseArrangImport/importCourseExcel?token=${token}`,
            method: 'post',
            data: formData,
            //responseType: 'json',
            //headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //headers: {'Content-Type': 'multipart/form-data'}
            //headers: {'Content-Type': 'application/json;charset=UTF-8'}
        }).then((res)=>{
          console.log(res)
        });*/

        /*this.props.courseArrangeImport(_data).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != "success") {
                message.error(data.message);
            }
            else {
                message.error("上传成功" + data.data.result);
                //this.onSearch();
            }
        })*/

        // You can use any AJAX library you like
        /*reqwest({
          url: '//jsonplaceholder.typicode.com/posts/',
          method: 'post',
          processData: false,
          data: formData,
          success: () => {
            this.setState({
              fileList: [],
              uploading: false,
            });
            message.success('upload successfully.');
          },
          error: () => {
            this.setState({
              uploading: false,
            });
            message.error('upload failed.');
          },
        });*/

      }
    })
    
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
    const { getFieldDecorator } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
        default:
        block_content = (
          <div>
            <Form className="ant-advanced-search-form" enctype="multipart/form-data" method="post">
              <Row gutter={24}>
              <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'项目'}>
                        {getFieldDecorator('itemId', {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择项目!' }],
                        })(
                            <SelectItem
                                scope={'my'}
                                hideAll={false}
                                isFirstSelected={false}
                                onSelectChange={(value) => {
                                    this.state.pagingSearch.courseplanBatchId = '';
                                    this.state.pagingSearch.itemId = value;
                                    this.setState({ pagingSearch: this.state.pagingSearch });
                                    setTimeout(() => {
                                        {/* 重新重置才能绑定这个科目值 */ }
                                        this.props.form.resetFields(['courseplanBatchId']);
                                    }, 1000);
                                }} />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'开课批次'} >
                        {getFieldDecorator('courseplanBatchId', {
                            initialValue: '',
                            rules: [{ required: true, message: '请选择开课批次!' }],
                        })(
                            <SelectItemCoursePlanBatch hideAll={false} isFirstSelected={false}
                                itemId={this.state.pagingSearch.itemId}
                                onSelectChange={(value, selectedOptions) => {

                                    this.state.pagingSearch.courseplanBatchId = value;
                                    this.setState({ pagingSearch: this.state.pagingSearch });

                                }}
                            />
                        )}
                    </FormItem>
                </Col>
                <Col span={24}>
                  点击
                  {/*<a onClick={() => { window.open('') }}>下载上传模板</a>*/}
                  <FileDownloader
                    apiUrl={'/edu/file/getFile'}//api下载地址
                    method={'post'}//提交方式
                    options={{ filePath: 'upload/importTemplate/courseUpload.xlsx' }}
                    title={'下载上传模板'}
                  >
                  </FileDownloader> 
                </Col>  
                    <p>特别提醒：课表信息以最新导入为准，请整理课程班完整的课表信息进行导入。 </p>
                <Col span={24}>
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
      <ContentBox titleName={"课表导入"} bottomButton={
        <FormItem
          className='btnControl'
          {...btnformItemLayout}
        >
          <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSave}>保存</Button>
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
const WrappedManage = Form.create()(CourseArrangeImportPage);

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
