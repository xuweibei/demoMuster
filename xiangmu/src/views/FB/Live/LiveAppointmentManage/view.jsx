
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import FileUploader from '@/components/FileUploader';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD hh:mm';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import { getLiveDetaile } from '@/actions/live';

class FaceTeachLiveView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel || {courseCategoryId:'',isPublic:0},//数据模型
            data: [],
            teacherInfo: []
        };
    }

    componentWillMount() {
        
        this.getLiveDetaile();

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
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据

                if(this.state.dataModel.liveId) values.liveId = this.state.dataModel.liveId;
                values.liveStartTime = formatMoment(values.liveStartTime,dateFormat);
                values.liveEndTime = formatMoment(values.liveEndTime,dateFormat);
                values.bookEndTime = formatMoment(values.bookEndTime,dateFormat);
                values.bookStartTime = formatMoment(values.bookStartTime,dateFormat);
                if(values.teacherId.length) values.teacherId = values.teacherId[0].id;

                that.props.viewCallback(values);

            }
        });
    }
    getLiveDetaile = () => {
        if(this.state.dataModel.liveId){
            this.props.getLiveDetaile({liveId:this.state.dataModel.liveId}).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'success') {
                var teacherInfo = [];
                if(data.data.teacherId){
                    teacherInfo.push({
                        id: data.data.teacherId,
                        name: this.state.dataModel.teacher
                    })
                }

                data.data.teacher = this.state.dataModel.teacher;
                data.data.itemName = this.state.dataModel.itemName;
                data.data.courseCategoryName = this.state.dataModel.courseCategoryName;


                this.setState({
                  dataModel: data.data,
                  teacherInfo: teacherInfo
                })
              }
              else {
                message.error(data.message);
              }
            })
        }
    }
    //标题
    getTitle() {
        //加载最新的数据
        let op = `${this.props.editMode == 'Edit' ? '编辑' : '添加'}`
        
        return `${op}直播`;
        
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
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        console.log(this.state.dataModel)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            {
                                this.state.dataModel.status ?
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label={'项目'}>
                                        {this.state.dataModel.itemName}
                                      </FormItem>
                                </Col>
                                :
                                <Col span={12}>
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
                                              this.setState({ dataModel: this.state.dataModel });
                                            }}
                                          />
                                        )}
                                      </FormItem>
                                </Col>
                            }

                            {
                                this.state.dataModel.status ?
                                <Col span={12} >
                                  <FormItem
                                    {...searchFormItemLayout}
                                    label="科目"
                                  >
                                    {this.state.dataModel.courseCategoryName}
                                  </FormItem>
                                </Col>
                                :
                                <Col span={12} >
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
                              <FormItem {...searchFormItemLayout} label={'直播名称'} >
                                {getFieldDecorator('liveName', { 
                                    initialValue: this.state.dataModel.liveName,
                                    rules: [{
                                        required: true, message: '请输入直播名称!',
                                    }]
                                 })(
                                  <Input placeholder="直播名称" />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'预约开始时间'} >
                                    {getFieldDecorator('bookStartTime', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.bookStartTime, true), true),
                                        rules: [{
                                            required: true, message: '请选择预约开始时间!',
                                        }]
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='开始时间' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'预约截止时间'} >
                                    {getFieldDecorator('bookEndTime', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.bookEndTime, true), true),
                                        rules: [{
                                            required: true, message: '请选择预约截止时间!',
                                        }]
                                    })(
                                        <DatePicker className="ant-calendar-picker_time" placeholder='截止时间' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
                                    )}
                                </FormItem>
                            </Col>
                            {
                                this.state.dataModel.status ?
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label={'开始时间'} >
                                        {getFieldDecorator('liveStartTime', {
                                            initialValue: dataBind(timestampToTime(this.state.dataModel.liveStartTime, true), true),
                                            rules: [{
                                                required: true, message: '请选择开始时间!',
                                            }]
                                        })(
                                            <DatePicker disabled className="ant-calendar-picker_time" placeholder='开始时间' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
                                        )}
                                    </FormItem>
                                </Col>
                                :
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label={'开始时间'} >
                                        {getFieldDecorator('liveStartTime', {
                                            initialValue: dataBind(timestampToTime(this.state.dataModel.liveStartTime, true), true),
                                            rules: [{
                                                required: true, message: '请选择开始时间!',
                                            }]
                                        })(
                                            <DatePicker className="ant-calendar-picker_time" placeholder='开始时间' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
                                        )}
                                    </FormItem>
                                </Col>
                            }
                            {
                                this.state.dataModel.status ?
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label={'结束时间'} >
                                        {getFieldDecorator('liveEndTime', {
                                            initialValue: dataBind(timestampToTime(this.state.dataModel.liveEndTime, true), true),
                                            rules: [{
                                                required: true, message: '请选择结束时间!',
                                            }]
                                        })(
                                            <DatePicker disabled className="ant-calendar-picker_time" placeholder='结束时间' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
                                        )}
                                    </FormItem>
                                </Col>
                                :
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label={'结束时间'} >
                                        {getFieldDecorator('liveEndTime', {
                                            initialValue: dataBind(timestampToTime(this.state.dataModel.liveEndTime, true), true),
                                            rules: [{
                                                required: true, message: '请选择结束时间!',
                                            }]
                                        })(
                                            <DatePicker className="ant-calendar-picker_time" placeholder='结束时间' format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
                                        )}
                                    </FormItem>
                                </Col>
                            }
                            
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label='直播背景图'
                                    extra={this.state.dataModel.bgImg && <a href={this.state.dataModel.bgImg} target='_Blank'>点我查看已上传的直播背景图</a>}>
                                  {getFieldDecorator('bgImg', {
                                    initialValue: dataBind(this.state.dataModel.bgImg),
                                    // rules: [{
                                    //         required: true, message: '请选择直播背景图!',
                                    //     }]
                                  })(
                                    <FileUploader />
                                    )}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label='学习资料'
                                    extra={this.state.dataModel.studyFile && <a href={this.state.dataModel.studyFile} target='_Blank'>点我查看已上传的学习资料</a>}>
                                  {getFieldDecorator('studyFile', {
                                    initialValue: dataBind(this.state.dataModel.studyFile),
                                  })(
                                    <FileUploader />
                                    )}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem {...searchFormItemLayout} label="允许学生预约">
                                    {getFieldDecorator('isPublic', {
                                      initialValue: dataBind(this.state.dataModel.isPublic),
                                      rules: [{
                                            required: true, message: '请选择是否允许学生预约!',
                                        }]
                                    })(
                                      <RadioGroup value={dataBind(this.state.dataModel.isPublic)} hasFeedback>
                                        {this.props.dic_YesNo.map((item, index) => {
                                          return <Radio value={item.value} key={index}>{item.title}</Radio>
                                        })}
                                      </RadioGroup>
                                      )}
                                  </FormItem>
                                </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'直播间ID'} >
                                {getFieldDecorator('liveRoomId', { 
                                    initialValue: this.state.dataModel.liveRoomId,
                                    rules: [{
                                        required: true, message: '请输入直播间ID!',
                                    }]
                                 })(
                                  <Input placeholder="直播间ID" />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'可预约人数'} >
                                {getFieldDecorator('maxBookCount', {
                                  initialValue: this.state.dataModel.maxBookCount,
                                    rules: [{
                                        required: true, message: '请输入可预约人数!',
                                    }]
                                })(
                                    <InputNumber min={0} step={1} />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'直播管理ID'} >
                                {getFieldDecorator('liveManageId', { 
                                    initialValue: this.state.dataModel.liveManageId,
                                    rules: [{
                                        required: true, message: '请输入直播管理ID!',
                                    }]
                                 })(
                                  <Input placeholder="直播管理ID" />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'直播间密码'} >
                                {getFieldDecorator('liveManagePassword', { 
                                    initialValue: this.state.dataModel.liveManagePassword,
                                    rules: [{
                                        required: true, message: '请输入直播间密码!',
                                    }]
                                 })(
                                  <Input placeholder="直播间密码" />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'教师'} >
                                {getFieldDecorator('teacherId', { 
                                    initialValue: (!this.state.teacherInfo.length ? [] : [{
                                        id: this.state.teacherInfo[0].id,
                                        name: this.state.teacherInfo[0].name
                                      }])
                                 })(
                                  <EditableTeacher  maxTags={1} />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'直播简介'} >
                                {getFieldDecorator('remark', { 
                                    initialValue: this.state.dataModel.remark
                                 })(
                                    <TextArea rows={4} placeholder="直播简介"/>
                                )}
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

const WrappedView = Form.create()(FaceTeachLiveView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getLiveDetaile: bindActionCreators(getLiveDetaile, dispatch),
        
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
