/*
考勤管理 上传考勤
2018-05-31
王强
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload
} from 'antd';
const FormItem = Form.Item;

import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
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

class ImportCourseArrangeStudentView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
  componentWillMount() {
  }

  onCancel = () => {
    this.props.viewCallback({});
  }
  onExport = () => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest;
    var url = `${env.serverURL}/edu/courseArrangeStudent/importExcel?token=${env.getToken()}`;
    xhr.open('POST', url, true)
    xhr.send(formData)
  }
  onSave = () => {
    var that = this;
    const { fileList } = this.state;
    const formData = new FormData();
    //fileList.forEach((file) => {
    //  formData.append('files[]', file);
    //});
    if (!fileList.length) {
      message.error("请上传一个文件");
      return;
    }
    let token = env.getToken();
    formData.append('file', fileList[0]);
    formData.append('courseArrangeDetailId', this.props.currentDataModel.courseArrangeDetailId);

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
          errorCount: data.data.falseCount,
          errorJsonObj: data.data.error,
          error_url: `/edu/courseArrangeDetailAttendance/exportErrAttend`,
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

    let uploadUrl = `${env.serverURL}/edu/courseArrangeDetailAttendance/importAttendExcel?token=${token}`;
    const xhr = new XMLHttpRequest
    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)
    xhr.open('POST', uploadUrl, true)
    xhr.send(formData)

  }

  render() {
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
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="开课批次">
                    {this.props.currentCoursePlanBatch.title}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="课程班">
                    {this.props.currentDataModel.courseplanName}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="科目">
                    {this.props.currentDataModel.courseCategoryName}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="上课日期">
                    {timestampToTime(this.props.currentDataModel.courseDate)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <div style={{ marginBottom: 10, marginLeft: '7%' }}>
                    点击<FileDownloader
                      apiUrl={'/edu/courseArrangeDetailAttendance/exportCoursePlanStudentInfo'}//api下载地址
                      method={'get'}//提交方式
                      options={{ 'courseArrangeDetailId': this.props.currentDataModel.courseArrangeDetailId }}//提交参数
                      title={'导出课程班学生信息'}
                    />，在此文件基础上进行出勤情况补充后，进行上传 。延期的学生不做考勤情况上传。
                  </div>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label='选择上传文档'>
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
      <ContentBox titleName={"上传考勤"} bottomButton={
        <FormItem
          className='btnControl'
          {...btnformItemLayout}
        >
          <Button type="primary" loading={this.state.loading} icon="upload" onClick={this.onSave}>上传</Button>
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
const WrappedManage = Form.create()(ImportCourseArrangeStudentView);

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
