 
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
 
import { env } from '@/api/env';

import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import ContentBox from '@/components/ContentBox'; 
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout
} from '@/utils/componentExt';
import FileDownloader from '@/components/FileDownloader';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import {TeachingPointCourseFB} from '@/actions/base'
import { getCoursePlanBatchByItemId  } from '@/actions/course';
import { loadDictionary } from '@/actions/dic'; 
const formItemLayout24 = {
  labelCol: { span: 12 },
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

class StudentPayfeeCustomersImprot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        CourseClass:[],
        OpenData:[],
        editMode: '',
        loading: false, 
        pagingSearch: {
            currentPage: 1,
            pageSize: 10,
            teachCenterId:'',  
            branchId: '',
            realName: '',
            materialName:'',
            orderSn: '',
            materialType:'', 
            teacher: '',
            itemId: '',
            courseCategoryId: '',
            receiveStartDate:null,
            courseplanName:''
        },
        uploading: false,
        fileList: [],

        isImported: false,
        successCount: 0,
        falseCount: 0,
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
  fetch = (params = {}) => { 
    var condition = params || this.state.pagingSearch;
    this.setState({
        pagingSearch:condition
    })
  } 
  onCancel = () => {
    this.props.viewCallback();
  }
  onExport = () => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest;
    var url = `${env.serverURL}/edu/materialReceive/importReceive?token=${env.getToken()}`;
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
    formData.append('token', token);

    this.setState({
      uploading: true,
      isImported: false,
      loading:true
    });

    this.setState({
      fileList: [],
    });

    const successFn = (response) => { 
      var data = eval('(' + xhr.responseText + ')');
      if (data.state == 'success') {
        // 假设服务端直接返回文件上传后的地址
        // 上传成功后调用param.success并传入上传后的文件地址
        //var _str = JSON.stringify(data.data.error);
        //var str = data.data.error.length ? encodeURI(_str) : ""; 
        that.setState({
          isImported: true,
          successCount: data.data.successCount,
          falseCount: data.data.falseCount,
          errorJsonObj: data.data.error,
          error_url: `/edu/materialReceive/exportError`,
        })
        //param.success({
        //  url: data.data.fullUrl
        //})
      }
      else {
        //param.error({ msg: data.message });
        message.error(data.msg);
      }
      this.setState({ 
         loading:false
      })
    }

    const progressFn = (event) => {
      // 上传进度发生变化时调用param.progress
      // param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      message.error('上传失败!');
      this.setState({ 
         loading:false
      })
    }

    let uploadUrl = `${env.serverURL}/edu/materialReceive/importReceive?token=${token}`;
    const xhr = new XMLHttpRequest
    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)
    xhr.open('POST', uploadUrl, true)
    //xhr.responseType
    xhr.send(formData)
  }
  onSelectChangeT = (value) =>{ 
    this.props.TeachingPointCourseFB({teachCenterId:value}).payload.promise.then((response) => {
        let data = response.payload.data; 
        if(data.state=='success'){
            this.setState({
                CourseClass:data.data
            })
        }else{
            message.error(data.msg)
        }
    })
  } 
  render() { 
      let center = '';
      let mode = {};
      this.props.form.validateFields((err, values) => { 
        center = values;
        for(let i in values){
          mode[i] = 111111
        }
        delete mode.itemId;
        delete mode.teachCenterId;
    }) 
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
    const { getFieldDecorator,resetFields } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
      default:
        block_content = (
          <div>
            <Form className="ant-advanced-search-form" enctype="multipart/form-data" method="post">
              <Row type='flex' justify='center'>
                <div style={{ marginBottom: 20 }}>
                  <FileDownloader
                    apiUrl={'/edu/materialReceive/exportStudent'}//api下载地址
                    method={'post'}//提交方式
                    options={mode}
                    title={'下载模板'}
                  >
                  </FileDownloader>
                </div>
              </Row>
              <Row gutter={24}  type="flex">
                
               
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                    {getFieldDecorator('teachCenterId', { initialValue: '' })(

                      <SelectTeachCenterByUser onSelectChange = {this.onSelectChangeT}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'开课批次'} >
                        {getFieldDecorator('courseplanBatchId', {
                            initialValue: this.state.pagingSearch.courseplanBatchId
                        })(
                            <SelectItemCoursePlanBatch hideAll={true} isFirstSelected={true}
                                itemId={this.state.pagingSearch.itemId}
                                onSelectChange={(value, selectedOptions) => {

                                    this.state.pagingSearch.courseplanBatchId = value;
                                    let currentCoursePlanBatch = selectedOptions;
                                    this.setState({ pagingSearch: this.state.pagingSearch, currentCoursePlanBatch });
                                    this.onSearch();

                                }}
                            />
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem {...searchFormItemLayout} label={'项目'}>
                        {getFieldDecorator('itemId', {
                            initialValue: this.state.pagingSearch.itemId
                        })(
                            <SelectItem
                                scope={'my'}
                                hideAll={false}
                                isFirstSelected={true}
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
                <Col span={12} >
                    <FormItem
                        {...searchFormItemLayout}
                        label="科目"
                    >
                        {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                            <SelectItemCourseCategory itemId={this.state.pagingSearch.itemId} hideAll={false} isMain={true}/>
                        )}
                    </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem 
                        {...searchFormItemLayout}
                        label = '课程班'
                    >
                        {
                            getFieldDecorator('courseplanName',{ initialValue:this.state.pagingSearch.courseplanName})(
                                <Select>
                                    <Option value=''>全部</Option>
                                    {
                                        this.state.CourseClass.map(item=>{
                                            return <Option value={item.courseArrangeId}>{item.courseplanName}</Option>
                                        })
                                    }
                                </Select>
                            )
                        }
                    </FormItem>
                </Col>
              </Row>
              <Row type='flex'  justify='center'>
                <div style={{ marginBottom: 20 }}>
                  选择教学点课程班，点击
                  <FileDownloader
                    apiUrl={'/edu/materialReceive/exportStudent'}//api下载地址
                    method={'post'}//提交方式
                    options={center}
                    title={'下载 非重修上课学生信息'}
                  >
                  </FileDownloader>
                  补充资料领取信息后，进行上传。
                </div>
              </Row> 
              <Row type='flex' justify='center'>
                <Col span={24}>
                  <FormItem {...formItemLayout24} label='选择上传文档'>
                    <Upload {...props} >
                      <Button>
                        <Icon type="upload" /> 选择文件上传
                      </Button>
                    </Upload>
                  </FormItem>
                </Col>
                {
                  this.state.isImported &&
                  <Col span={24}>
                    成功导入{this.state.successCount}条。导入失败{this.state.falseCount}条。
                    {this.state.falseCount ?
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
          </div >
        )
        break;
    }
    return (
      <ContentBox titleName={"学生教材领取信息导入"} bottomButton={
        <FormItem
          className='btnControl'
          {...btnformItemLayout}
        >
          <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSave}>保存</Button>
          <span className="split_button"></span>
          <Button loading={this.state.loading} icon="rollback" onClick={this.onCancel} >返回</Button>
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
const WrappedManage = Form.create()(StudentPayfeeCustomersImprot);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    getCoursePlanBatchByItemId: bindActionCreators(getCoursePlanBatchByItemId, dispatch),
    //课程班随教学点联动
    TeachingPointCourseFB: bindActionCreators(TeachingPointCourseFB, dispatch)
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
