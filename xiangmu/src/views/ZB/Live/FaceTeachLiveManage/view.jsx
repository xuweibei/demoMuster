
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Checkbox, Input, Button, Icon, DatePicker, InputNumber, Radio, message } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const CheckboxGroup = Checkbox.Group
import { env } from '@/api/env';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import FileUploader from '@/components/FileUploader';
import PicZipUploader from '@/components/PicZipUploader';
import EditableTeacher from '@/components/EditableTeacher';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import FileDownloader from '@/components/FileDownloader';

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD HH:mm';

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
            allowArr:[],
            dataModel: props.currentDataModel || {courseCategoryId:'',isPublic:''},//数据模型
            data: [],
            teacherInfo: [],
            startValue: null,
              endValue: null,
              endOpen: false,
              startValue2: null,
              endValue2: null,
              endOpen2: false,
              isUpload: true
        };
    }

    componentWillMount() {
        
        this.loadBizDictionary(['live_book_type']);
        this.getLiveDetaile(); 
    }
    componentDidMount(){ 
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
                let arr = [];
                this.state.allowArr.forEach(item=>{
                    if(Array.isArray(values.publics)){ 
                        values.publics.forEach(pp=>{
                            if(item.value == pp ){
                                arr.push(pp)
                            }
                        }) 
                    }else{ 
                        arr = this.state.dataModel.publics.replace(',','').split(',')
                    }
                })    
                if( arr.some(item=>item == 0) ){ 
                    values.isPublic = 0;
                }else{ 
                    values.isPublic = 1;
                } 
                this.props.setSubmitLoading(true); 
                if( arr.length > 1 ){
                    values.publics = arr.join(',')
                }else{
                    values.publics = arr.join('')
                }
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

                let arr = this.props.live_book_type; 
                let limine = data.data.publics?data.data.publics.replace(',',''):''; 
                console.log(limine)
                if( limine.length ){
                    
                    if(limine.indexOf(0) != -1){ 
                        arr = this.props.live_book_type.filter( item => item.value == 0 )
                    }
                }     
                data.data.teacher = this.state.dataModel.teacher;
                data.data.itemName = this.state.dataModel.itemName;
                data.data.courseCategoryName = this.state.dataModel.courseCategoryName;


                this.setState({
                  dataModel: data.data,
                  teacherInfo: teacherInfo,
                  allowArr:arr
                })
              }
              else {
                message.error(data.message);
              }
            })
        }else{ 
            let arr = this.props.live_book_type; 
            this.setState({ 
                allowArr:arr
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
            <Button type="primary" loading={this.props.submitLoading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

     disabledStartDate = (startValue) => {
      const endValue = this.state.endValue;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
      const startValue = this.state.startValue;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() < startValue.valueOf();
  }
  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({ endOpen: true });
      }
  }

  handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
  }
  onChange = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange = (value) => {
      this.onChange('startValue', value);
  }

  onEndChange = (value) => {
      this.onChange('endValue', value);
  }


   disabledStartDate2 = (startValue) => {
      const endValue = this.state.endValue2;
      if (!startValue || !endValue) {
          return false;
      }
      return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate2 = (endValue) => {
      const startValue = this.state.startValue2;
      if (!endValue || !startValue) {
          return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
  }
  handleStartOpenChange2 = (open) => {
      if (!open) {
          this.setState({ endOpen2: true });
      }
  }

  handleEndOpenChange2 = (open) => {
      this.setState({ endOpen2: open });
  }
  onChange2 = (field, value) => {
      this.setState({
          [field]: value,
      });
  }

  onStartChange2 = (value) => {
      this.onChange('startValue2', value);
  }

  onEndChange2 = (value) => {
      this.onChange('endValue2', value);
  }


  onUploadFile = (flag) => {
    this.setState({
        isUpload: flag
    })
  }
  onCheckboxChange = (value) => {    
      let arr = this.state.allowArr;
      if(value.length){
        if(value.filter(a=>a === '0').length){
            arr = this.state.live_book_type.filter(item=>{ 
                return item.value == 0
            })
        }else{ 
            arr = this.state.live_book_type
        }
      }else{
        arr = this.state.live_book_type
      }
      this.setState({
        allowArr:arr
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
                                  <FormItem {...searchFormItemLayout} label="允许学生预约">
                                    {getFieldDecorator('publics', {
                                      initialValue: this.state.dataModel.publics?this.state.dataModel.publics.split(','):[],
                                      rules: [{
                                            required: true, message: '请选择直播预约类型!!',
                                        }]
                                    })(
                                        <CheckboxGroup onChange={this.onCheckboxChange}>
                                            {
                                            this.state.allowArr.map((item, index) => {
                                                return <Checkbox value={item.value} key={index}>{item.title}{item.state === 0 ? '【停用】' : ''}</Checkbox>
                                            })
                                            }
                                        </CheckboxGroup>
                                    //   <RadioGroup value={dataBind(this.state.dataModel.isPublic)} hasFeedback>
                                    //     {this.props.dic_YesNo.map((item, index) => {
                                    //       return <Radio value={item.value} key={index}>{item.title}</Radio>
                                    //     })}
                                    //   </RadioGroup>
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
                                        <DatePicker className="ant-calendar-picker_time" placeholder='开始时间' format="YYYY-MM-DD" 
                                            disabledDate={this.disabledStartDate2}
                                              onChange={this.onStartChange2}
                                              onOpenChange={this.handleStartOpenChange2}
                                        />
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
                                        <DatePicker className="ant-calendar-picker_time" placeholder='截止时间' format="YYYY-MM-DD"
                                            disabledDate={this.disabledEndDate2}
                                              onChange={this.onEndChange2}
                                              open={this.state.endOpen2}
                                              onOpenChange={this.handleEndOpenChange2}
                                         />
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
                                            <DatePicker
                                              disabled
                                              className="ant-calendar-picker_time"
                                              format="YYYY-MM-DD HH:mm"
                                              showTime={{ format: 'HH:mm' }}
                                              disabledDate={this.disabledStartDate}
                                              onChange={this.onStartChange}
                                              onOpenChange={this.handleStartOpenChange}
                                              placeholder='开始日期'
                                            />
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
                                            <DatePicker
                                              className="ant-calendar-picker_time"
                                              format="YYYY-MM-DD HH:mm"
                                              showTime={{ format: 'HH:mm' }}
                                              disabledDate={this.disabledStartDate}
                                              onChange={this.onStartChange}
                                              onOpenChange={this.handleStartOpenChange}
                                              placeholder='开始日期'
                                            />
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
                                            <DatePicker
                                              disabled
                                              className="ant-calendar-picker_time"
                                              format="YYYY-MM-DD HH:mm"
                                              showTime={{ format: 'HH:mm' }}
                                              disabledDate={this.disabledEndDate}
                                              onChange={this.onEndChange}
                                              open={this.state.endOpen}
                                              onOpenChange={this.handleEndOpenChange}
                                              placeholder='结束日期'
                                            />
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
                                            <DatePicker
                                              className="ant-calendar-picker_time"
                                              format="YYYY-MM-DD HH:mm"
                                              showTime={{ format: 'HH:mm' }}
                                              disabledDate={this.disabledEndDate}
                                              onChange={this.onEndChange}
                                              open={this.state.endOpen}
                                              onOpenChange={this.handleEndOpenChange}
                                              placeholder='结束日期'
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                            }
                            
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label='直播背景图'
                                    extra={this.state.dataModel.bgImg && <a href={this.state.dataModel.bgImg} target='_Blank'>查看已上传的直播背景图</a>}>
                                    {getFieldDecorator('bgImg', {
                                      initialValue: dataBind(this.state.dataModel.bgImg),
                                      rules: [{
                                              required: true, message: '请选择直播背景图!',
                                          }]
                                    })(
                                      <PicZipUploader type="pic" onUploadFile={this.onUploadFile}/>
                                    )}
                                    <p style={{paddingTop:10}}>请上传650*350px的图片</p>
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label='学习资料'
                                    extra={this.state.dataModel.studyFile && <a href={this.state.dataModel.studyFile} target='_Blank'>下载已上传的学习资料</a>}>
                                    {getFieldDecorator('studyFile', {
                                      initialValue: dataBind(this.state.dataModel.studyFile),
                                    })(
                                      <PicZipUploader type="zip" onUploadFile={this.onUploadFile}/>
                                    )}
                                    <p style={{paddingTop:10}}>请上传rar/zip/pdf格式的文件</p>
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
                                &nbsp;&nbsp;人
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              {/*目前一个CC账号所以暂时写死默认管理ID*/}
                              <FormItem {...searchFormItemLayout} label={'直播管理ID'} >
                                {getFieldDecorator('liveManageId', { 
                                    initialValue: this.state.dataModel.liveManageId || 'CB735BE8334BC857',
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
                                    initialValue: this.state.dataModel.liveManagePassword
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
                                      }]),
                                        rules: [{
                                            required: true, message: '请选择教师!',
                                        }]
                                      })(
                                  <EditableTeacher  maxTags={1} />
                                )}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'有效天数'} >
                                {getFieldDecorator('validDays', {
                                  initialValue: this.state.dataModel.validDays || 40,
                                    rules: [{
                                        required: true, message: '请输入有效天数!',
                                    }]
                                })(
                                    <InputNumber min={0} step={1} />
                                )}
                                &nbsp;&nbsp;天
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'课时'} >
                                {getFieldDecorator('classHour', {
                                  initialValue: this.state.dataModel.classHour,
                                    rules: [{
                                        required: true, message: '请输入课时!',
                                    }]
                                })(
                                    <InputNumber min={0} step={1} />
                                )}
                                &nbsp;&nbsp;课时
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
