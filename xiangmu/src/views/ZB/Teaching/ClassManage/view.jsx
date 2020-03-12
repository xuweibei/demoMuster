
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Table, Input, Select, Button, Icon, DatePicker, InputNumber, Radio, message } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
import { env } from '@/api/env';
const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const { RangePicker } = DatePicker;

import PicZipUploader from '@/components/PicZipUploader';
import EditableUser from '@/components/EditableUser';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import { classBatchPageList } from '@/actions/teaching';

class ClassManageView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel || {courseCategoryId:'',courseName: '',classBatchId:''},//数据模型
            data: [],
            teacherInfo: [],
            isUpload: true,
            classBatchList: [],
        };
    }

    componentWillMount() {

        this.getClassBatch();

        //回显教师
        var teacherInfo = [];
        teacherInfo.push({
            id: this.state.dataModel.classTeacherId,
            name: this.state.dataModel.classTeacherName
        })
        this.setState({
            teacherInfo: teacherInfo
        })
    }

    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {

        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {

                
                if(!this.state.isUpload){
                    message.error('请等待文件上传完成后再试！');
                    return;
                }

                if(values.weeks.toString().indexOf('.') > -1 ){
                    message.error('周数请输入大于0的整数！');
                    return;
                }

                let starTime = values.starTime;
                if(starTime){
                    values.starTime = starTime[0];
                    values.endTime = starTime[1];
                }

                this.props.setSubmitLoading(true);
                
                if(this.state.dataModel.classId) values.classId = this.state.dataModel.classId;
                values.starTime = formatMoment(values.starTime);
                values.endTime = formatMoment(values.endTime);
                if(values.classTeacherId.length) values.classTeacherId = values.classTeacherId[0].id;

                that.props.viewCallback(values);

            }
        });
    }

    //标题
    getTitle() {
        //加载最新的数据
        let op = `${this.props.editMode == 'Edit' ? '编辑' : '添加'}`
        
        return `${op}班级`;
        
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.props.submitLoading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    

  onUploadFile = (flag) => {
    this.setState({
        isUpload: flag
    })
  }

  getClassBatch = () => {
    //enable:true  未过期的批次
    this.props.classBatchPageList({itemId:this.state.dataModel.itemId,enable: true}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        if(this.state.dataModel.classBatchId){
            if(data.data.filter( a => a.classBatchId == this.state.dataModel.classBatchId).length < 1){
                data.data.push({
                    classBatchId: this.state.dataModel.classBatchId,
                    classBatchName: this.state.dataModel.classBatchName,
                })
            }
        }
        this.setState({
          classBatchList:data.data,
        })
      }
      else {
        message.error(data.message);
      }
    })
  }
    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            {
                                this.state.dataModel.courseName ? <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'项目'}>
                                    {getFieldDecorator('itemId', {
                                        initialValue: this.state.dataModel.itemId,
                                        rules: [{
                                            required: true, message: '请选择项目!',
                                        }]
                                    })(
                                        <Select disabled>
                                            <Option value={this.state.dataModel.itemId} key={1}>{this.state.dataModel.itemName}</Option>
                                        </Select>
                                    )}
                                    </FormItem>
                            </Col>
                            : <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'项目'}>
                                    {getFieldDecorator('itemId', {
                                        initialValue: this.state.dataModel.itemId,
                                        rules: [{
                                            required: true, message: '请选择项目!',
                                        }]
                                    })(
                                        <SelectItem
                                        scope={'my'}
                                        hideAll={true}
                                        onSelectChange={(value) => {
                                            this.state.dataModel.itemId = value;
                                            this.state.dataModel.courseCategoryId = '';
                                            this.state.dataModel.classBatchId = '';
                                            this.setState({ dataModel: this.state.dataModel });
                                            setTimeout(() =>{
                                                this.props.form.resetFields(['courseCategoryId','classBatchId']);
                                                this.getClassBatch();
                                            },300)
                                        }}
                                        />
                                    )}
                                    </FormItem>
                            </Col>
                            }
                            {
                                this.state.dataModel.courseName ? <Col span={12} >
                                    <FormItem
                                    {...searchFormItemLayout}
                                    label="科目"
                                    >
                                    {getFieldDecorator('courseCategoryId', { 
                                        initialValue: this.state.dataModel.courseCategoryId,
                                        rules: [{
                                                required: true, message: '请选择科目!',
                                            }]
                                        })(
                                        <Select disabled>
                                            <Option value={this.state.dataModel.courseCategoryId} key={1}>{this.state.dataModel.courseCategoryName}</Option>
                                        </Select>
                                    )}
                                    </FormItem>
                                </Col>
                                : <Col span={12} >
                                    <FormItem
                                    {...searchFormItemLayout}
                                    label="科目"
                                    >
                                    {getFieldDecorator('courseCategoryId', { 
                                        initialValue: this.state.dataModel.courseCategoryId,
                                        rules: [{
                                                required: true, message: '请选择科目!',
                                            }]
                                        })(
                                        <SelectItemCourseCategory isMain={true} itemId={this.state.dataModel.itemId} hideAll={false} />
                                    )}
                                    </FormItem>
                                </Col>
                            }
                            

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="批次">
                                    {getFieldDecorator('classBatchId', {
                                        initialValue: dataBind(this.state.dataModel.classBatchId),
                                        rules: [{
                                            required: true, message: '请选择批次!',
                                        }]
                                    })(
                                    <Select>
                                        <Option value="">--请选择--</Option>
                                        {this.state.classBatchList.map((item, index) => {
                                        return <Option value={item.classBatchId} title={item.classBatchName} key={index}>{item.classBatchName}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'班级名称'} >
                                {getFieldDecorator('className', { 
                                    initialValue: this.state.dataModel.className,
                                    rules: [{
                                        required: true, message: '请输入班级名称!',
                                    }]
                                 })(
                                  <Input placeholder="班级名称" />
                                )}
                              </FormItem>
                            </Col>
                            
                            <Col span={12}>
              
                            <FormItem
                                {...searchFormItemLayout}
                                label="有效期">
                                {getFieldDecorator('starTime', { 
                                    initialValue: this.state.dataModel.starTime?[moment(timestampToTime(this.state.dataModel.starTime),dateFormat),moment(timestampToTime(this.state.dataModel.endTime),dateFormat)]:[],
                                    rules: [{
                                    required: true, message: '请选择有效日期!',
                                    }],
                                })(
                                    <RangePicker style={{width:220}}/>
                                )}
                            </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                {...searchFormItemLayout}
                                label={'周数'}
                                >
                                {getFieldDecorator('weeks', {
                                    initialValue: this.state.dataModel.weeks,
                                    rules: [{
                                    required: true, message: '请输入大于0的整数!',
                                    }],
                                })(
                                    <InputNumber min={1} max={Infinity} step={1}/>
                                    )}
                                    &nbsp;周
                                </FormItem>
                            </Col>

                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'班主任'} >
                                {getFieldDecorator('classTeacherId', { 
                                    initialValue: (!this.state.teacherInfo.length ? [] : [{
                                        id: this.state.teacherInfo[0].id,
                                        name: this.state.teacherInfo[0].name
                                      }]),
                                        rules: [{
                                            required: true, message: '请选择班主任!',
                                        }]
                                      })(
                                  <EditableUser  maxTags={1} />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={24}></Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label='班级二维码'
                                    extra='请上传文件格式为jpg或png且小于50k图片'>
                                    {getFieldDecorator('qrCodeUrl', {
                                      initialValue: dataBind(this.state.dataModel.qrCodeUrl),
                                      rules: [{
                                              required: true, message: '请选择班级二维码!',
                                          }]
                                    })(
                                      <PicZipUploader type="pic" onUploadFile={this.onUploadFile}/>
                                    )}
                                {this.state.dataModel.qrCodeUrl && <img style={{width:150,height:150,margin: '10px 0'}} src={env.serverURL+this.state.dataModel.qrCodeUrl} />}
                                    
                                </FormItem>

                              </Col>
                            
                        </Row>
                    </Form>
                );
                break;
            case "View":
                block_content = (
                    <Form>
                        
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView_CourseProduct();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(ClassManageView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        classBatchPageList: bindActionCreators(classBatchPageList, dispatch),
        
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
