 
import React from 'react'; 
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal, Upload
} from 'antd';
const FormItem = Form.Item;

import { dataBind } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox'; 
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout
} from '@/utils/componentExt';
import FileDownloader from '@/components/FileDownloader';
 
const formItemLayout24 = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};
const btnformItemLayout = {
  wrapperCol: { span: 24 },
};
 
class StudentPayfeeCustomersImprot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: '',
      loading: false,
      pagingSearch: props.pagingSearch,
      dataModel: props.currentDataModel,//数据模型

      uploading: false,
      fileList: [],

      isImported: false,
      successCount: 0,
      errorCount: 0,
      errorJsonStr: '',
      error_url: ''
    };
    this.onSearch = onSearch.bind(this); 
    (this: any).onSave = this.onSave.bind(this);
    (this: any).onExport = this.onExport.bind(this);
  }
  componentWillMount() {
    console.log(this.props)
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onExport = () => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest;
    var url = `${env.serverURL}/edu/studentPayfeeCustomers/importExcel?token=${env.getToken()}`;
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
      isImported: false
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
          errorCount: data.data.errorCount,
          errorJsonObj: data.data.error,
          error_url: `/edu/materialImport/exportStudentMaterialError`,
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

    let uploadUrl = `${env.serverURL}/edu/materialImport/importStudentMaterial?token=${token}`;
    const xhr = new XMLHttpRequest
    xhr.upload.addEventListener("progress", progressFn, false)
    xhr.addEventListener("load", successFn, false)
    xhr.addEventListener("error", errorFn, false)
    xhr.addEventListener("abort", errorFn, false)
    xhr.open('POST', uploadUrl, true)
    //xhr.responseType
    xhr.send(formData)
  }

  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
     if (!err) {
       this.setState({ loading: true });
       setTimeout(() => {
         this.setState({ loading: false });
       }, 3000);//合并保存数据
       if (this.props.editMode == 'Edit') {
         var postData = {
           ids: this.state.dataModel.studentId,
           benefitUserId: values.marketUserId,
         }
       }else if(this.props.editMode == 'editpUser'){
          values.studentCourseApplyIds = this.state.studentCourseApplyId
       }
       else {
         var postData = {
           ids: this.props.UserSelecteds.join(','),
          // branchId: values.branchId,
           regionId: values.areaId,
          // marketUserId: values.marketUserId,
          // pconsultUserId: values.pconsultUserId,
          // fconsultUserId: values.fconsultUserId,
           type:this.state.dataModel.type,
         }
       }
       this.props.viewCallback({ ...values, ...postData, });//合并保存数据
     }
   });
 }

  render() {
    const { uploading } = this.state;
    const { getFieldDecorator } = this.props.form;
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
    switch (this.props.editMode) { 
      case "editpUser":
      block_content = (
        <Form className="search-form">
           <p style={{marginLeft:'4%',marginBottom:'30px',fontSize:16,color:'black'}}>
                 您选择了<span style={{color:'red',margin:'0 10'}}>{this.state.dataModel.taskMan.length}</span>学生网课进行讲义领取设置。
           </p> 
          <Row gutter={24}>
          <Col span={12}>
            <FormItem {...searchFormItemLayout} label="领取讲义">
              {getFieldDecorator('isPass', {
                initialValue: dataBind(this.state.dataModel.isAdmitOther),
                rules: [{
                  required: true, message: '请选择审核结果!',
                }],
              })(
                <Select>
                  <Option value=''>全部</Option>
                </Select>
              )}
            </FormItem>
          </Col> 
          <Col span={12}></Col>
          </Row>
        </Form>
      );
      break;
      case 'Manage':
      default:
        block_content = (
          <div>
            <Form className="ant-advanced-search-form" encType="multipart/form-data" method="post"> 
            <p style={{marginBottom:20}}>请在上页导出学生信息，整理学生讲义领取信息进行导入。若学生网课已存在讲义领取信息，再次上传，将保存最新上传的信息。</p>
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
          </div >
        )
        break;
    }
    return (
      <ContentBox titleName={"学生网课讲义批量导入"} bottomButton={
        <FormItem
          className='btnControl'
          {...btnformItemLayout}
        >
          {
            this.props.editMode == 'editpUser'?<Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button>:
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSave}>保存</Button>
          }
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
const WrappedManage = Form.create()(StudentPayfeeCustomersImprot);

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
