 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Form, Row, Col, Input, Select, Button,Tag, Tooltip,AutoComplete, Radio, message, DatePicker
} from 'antd'; 
const FormItem = Form.Item; 
const RadioGroup = Radio.Group;
const { TextArea } = Input;

import { loadBizDictionary, searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, timestampToTime,dataBind,formatMoment } from '@/utils';
 
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import { getCampusByUniversityId } from '@/actions/base';
import EditableAllUniversityTagGroup from '@/components/EditableAllUniversityTagGroup';
import AreasSelect from '@/components/AreasSelect';
import { allUniversityList } from '@/actions/admin'; 
import { getStudentById,studentCheck } from '@/actions/recruit'; 
import { ResultInputEdit } from '@/actions/stuService';
const dateFormat = 'YYYY-MM-DD';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class Detail extends React.Component {
    constructor(props) {
        super(props)

        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.state = { 
            bz_campus_list:[],
            dataSource:[],
            inputVisible:true,
            tags:[],
            bz_gain_way_list:[],
            dataModel: { ...props.currentDataModel, stageList: [] },
            webCourseList:[],
            faceCourseList:[],
            //激活状态0、未激活 1、已激活 2、已激活未过期 3、已激活已过期
            activeState : [
                { title: '未激活', value: '0', state: 1 },
                { title: '已激活', value: '1', state: 1 },
                { title: '已激活未过期', value: '2', state: 1 },
                { title: '已激活已过期', value: '3', state: 1 },
            ],
            isGive : [
                { title: '是', value: '1', state: 1 },
                { title: '否', value: '0', state: 1 }
            ]
        };
    }
    componentWillMount() {
      //载入需要的字典项
      this.loadBizDictionary([ 'category_state','dic_sex','teach_class_type','certificate_type','bz_region_list','education','reg_source','sex','nation']);  
        this.fetch()
    } 
    fetch = () => { 
        this.props.getStudentById({ studentId:this.props.currentDataModel.studentId}).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state == 'success'){
                    let onOff = false;
                    data.data.isStudy == 0?onOff = true:onOff = false;
                    if(data.data.studyUniversityId && data.data.studyUniversityName){
                        let tags = [{universityId:data.data.studyUniversityId,universityName:data.data.studyUniversityName}]; 
                        this.setState({
                            inputVisible:false,
                            tags
                        })
                        this.getCampus(data.data.studyUniversityId);
                    }
                    this.setState({
                        dataModel:data.data,
                        onOff
                    })
                }else{
                    message.error(data.msg);
                }
            }
        )
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    Verification = () => {
        
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let condition = {};
                condition.certificateNo = values.certificateNo;
                condition.certificateType = values.certificateType;
                condition.mobile = values.mobile;
                condition.weixin = values.weixin;
                condition.qq = values.qq;  
                condition.userId = this.state.dataModel.userId; 
                this.props.studentCheck(condition).payload.promise.then((response) => {
                    let data = response.payload.data;  
                    if(data.state == 'success'){ 
                        this.onSubmit();
                    }else{
                        message.error(data.msg)
                        return
                    } 
                    }
                ) 
             }
        })
      
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {      
                that.setState({ loading: true });    
                if(values.studyUniversityId){
                    values.studyUniversityId = this.state.tags[0].universityId;
                } 
                if(Array.isArray(values.graduateUniversityName)){
                    values.graduateUniversityId = values.graduateUniversityName[0].id;
                }
                values.workDate = formatMoment(values.workDate)
                if(Array.isArray(values.highSchoolAreaId)){ 
                    values.highSchoolAreaId =values.highSchoolAreaId[values.highSchoolAreaId.length - 1]; 
                } 
                if(Array.isArray(values.areaId)){ 
                    values.areaId =values.areaId[values.areaId.length - 1]; 
                }  
                values.studentId = this.state.dataModel.studentId; 
                this.props.ResultInputEdit(values).payload.promise.then((response) => {
                            let data = response.payload.data; 
                            if(data.state == 'success'){
                                message.success('修改成功!');
                                this.props.viewCallback('true');
                            }else{
                                message.error(data.msg);
                            }
                            this.setState({
                                loading:false
                            })
                        }
                ) 
                return
                if (this.props.editMode == 'Audit') {
                    this.props.viewCallback({ studentChangeId: this.state.dataModel.studentChangeId, ...values });
                }
            }
        });
    } 
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.Verification}>保存</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >返回</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
  //table 输出列定义
  columns = [
    {
      title: '开课批次',
      fixed: 'center',
      dataIndex: 'courseplanBatchName'
    },
    {
      title: '教学点',
      dataIndex: 'teachCenterName'
    },
    {
      title: '课程班',
      dataIndex: 'courseplanName'
    },
    {
      title: '课程班类型',
      dataIndex: 'teachClassType',
      render:(text,record)=>{
        return getDictionaryTitle(this.state.teach_class_type,record.teachClassType)
      }
    },
    {
      title: '开课时段',
      dataIndex: 'startDate',
      render: (text, record, index) => {
        return (timestampToTime(record.startDate) + '至' + timestampToTime(record.endDate));
      }
    },
    {
      title: '课次',
      dataIndex: 'courseNum'
    },
    {
      title: '排课课时',
      dataIndex: 'classHour'
    },
    {
      title: '预估考季',
      dataIndex: 'examBatchName',
    },
    {
      title: '学习情况',
      dataIndex: 'studyStatus',
    }];
    //table 输出列定义
    columnweb= [
    {
      title: '课程名称',
      fixed: 'center',
      dataIndex: 'courseName'
    },
    {
      title: '所属商品名称',
      dataIndex: 'courseProductName'
    },
    {
      title: '是否赠送',
      dataIndex: 'isGive',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.isGive, record.isGive);
      }
    },
    {
      title: '激活状态',
      dataIndex: 'activeStateResult',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.activeState, record.activeStateResult);
      }
    },
    {
      title: '激活时间',
      dataIndex: 'activeTime',
      render: (text, record, index) => {
        return timestampToTime(record.activeTime);
      }
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      render: (text, record, index) => {
        return timestampToTime(record.endTime);
      }
    },
    {
      title: '考试时间',
      dataIndex: 'examinationDate',
      render: (text, record, index) => {
        return timestampToTime(record.examinationDate);
      }
    }];
    
    onUniversityChoose = (value, name) => {
        
        if(value && value.length && value[0].id){
        if(name == "studyUniversityId"){

            this.getCampus(value[0].id);
        }
        var p = this.state.pagingSearch;
        p[name] = value;
        this.setState({
            pagingSearch: p
        })
        }
        if(value && value.length < 1){
        this.setState({ bz_campus_list: [] });
        var p = this.state.pagingSearch;
        
        p.studyCampusId = '';
        this.setState({ pagingSearch: p })
        }
    }
    
    //获取校区
    getCampus(universityId){
        if(!universityId){
        return;
        }
        let condition = { currentPage: 1, pageSize: 999, universityId: universityId };
        this.props.getCampusByUniversityId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(item => {
                list.push({
                    title: item.campusName,
                    value: item.campusId.toString()
                })
                })
                this.setState({ bz_campus_list: list })
            }else {
                message.error(data.message);
            }
        })
    } 
    
    renderOption(item) { 
        return <Option value={item.universityId} key={item.universityId} text={item.universityName}>
                  {item.universityName}
                  {/* <span style={{float:'right'}}>{item.isPack ? item.isPack : ''}</span> */}
                </Option>
    }
    
    onSelect = (value, option) => {  
        const state = this.state;
        let tags = state.tags; 
        var info = this.state.dataSource.find(a => a.universityId == option.key);
        if (tags.find(A => A.universityId == info.universityId) == null) {
            tags = [...tags, info];
        }   
        this.getCampus(option.key)
        this.setState({
            tags,
            dataArr:tags,
            inputVisible: false,
            inputValue: '',
            dataSource: []
        }); 
    }
    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag.universityId.toString() != removedTag.universityId); 
        this.state.dataModel.studyCampusId = '';
        this.setState({ tags,inputVisible:true,dataArr:[],dataModel:this.state.dataModel,bz_campus_list:[] }); 
    } 
    
    handleSearch = (value) => {  
        if(value.length < 4){
            return;
        }
        var searchOptions = this.props.searchOptions || {};
        var re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则 
        if (value && value.indexOf(' ')!=0) {
            
            this.props.allUniversityList({universityName:value}).payload.promise.then((response) => {

                let data = response.payload.data;  
                if (data.state === 'success') { 
                    this.setState({
                        allId:data.data,
                        dataSource: data.data.map((item) => { 
                            return { 
                                areaId: `${item.areaId}`,
                                universityCode: `${item.universityCode}`, 
                                universityId:item.universityId,
                                materialType:item.materialType,
                                universityLevel:item.universityLevel,
                                universityName:item.universityName
                            }
                            
                        })
                    })
                }
                else {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
            })
        
        } 
    } 

    RadioChange = (value) =>{ 
        let num = value.target.value;
        if( num==1 ){
            this.setState({
                onOff:false
            })
        }else if(num == 0){
            this.setState({
                onOff:true
            })
        }
    }
    render() {   
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let stageArry = []; 
            block_content = (
                <Form>
                    <Row gutter={24}> 
                        <Col span={24} className='formTitle' >
                            <FormItem {...(searchFormItemLayout24)} label={'学生关键信息'}>
                                <div>{}</div>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="所属分部">
                                {this.state.dataModel.branchName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="所属区域">
                                {this.state.dataModel.regRegionName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="学生来源">
                            {getDictionaryTitle(this.state.reg_source,this.state.dataModel.regSource)}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="市场人员">
                            {this.state.dataModel.benefitMarketUserName}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="电咨人员">
                            {this.state.dataModel.benefitPconsultUserName}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="面咨人员">
                            {this.state.dataModel.benefitFconsultUserName}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="姓名">
                            {this.state.dataModel.realName}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="性别">
                            {getDictionaryTitle(this.state.sex,this.state.dataModel.gender)}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="证件类型"> 
                            {getDictionaryTitle(this.state.certificate_type, this.state.dataModel.certificateType)}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="证件号码">
                            {this.state.dataModel.certificateNo}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="出生日期">
                            {timestampToTime(this.state.dataModel.birth)}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="民族">
                            {getDictionaryTitle(this.state.nation, this.state.dataModel.nationId)}
                        </FormItem>
                        </Col> 
                    </Row>
                    <Row gutter={24}>
                        <Col span={24} className='formTitle' >
                            <FormItem {...(searchFormItemLayout24)} label={'学生目前情况'}>
                                <div>{}</div>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout} label="目前情况"
                            >
                            {getFieldDecorator('isStudy', {
                                initialValue: dataBind(this.state.dataModel.isStudy),
                                rules: [{
                                    required: true, message: '请选择目前情况!',
                                }],
                                })(
                                <RadioGroup onChange={this.RadioChange} value={dataBind(this.state.dataModel.isAdmitOther)} hasFeedback>
                                    <Radio value='1' >就读</Radio>
                                    <Radio value='0' >在职</Radio>
                                </RadioGroup>
                            )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout} label="当前学历"
                            >
                            {getFieldDecorator('educationId', {
                                initialValue: dataBind(this.state.dataModel.educationId),
                                rules: [{
                                    required: true, message: '请选择当前学历!',
                                }],
                            })(
                                <Select>
                                    <Option value="">--请选择--</Option>
                                    {
                                        this.state.education.map(item=>{
                                            return <Option value={item.value}>{item.title}</Option>
                                        })
                                    }
                                </Select>
                            )}
                            </FormItem>
                        </Col>
                        {
                            this.state.onOff?<div>
                                
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'本科或专科毕业院校'}>
                                {getFieldDecorator('graduateUniversityName', {
                                    // initialValue:dataBind(this.state.dataModel.graduateUniversityName),
                                    initialValue: (!this.state.dataModel.graduateUniversityName ? [] : [{
                                        id: this.state.dataModel.graduateUniversityId,
                                        name: this.state.dataModel.graduateUniversityName
                                      }]),
                                    rules:[{ required:true,message:'请输入院校名称'}]
                                })(
                                    <EditableAllUniversityTagGroup  {...this.state} maxTags={1}
                                        // onChange={(value) => this.onUniversityChoose(value, item.name)}
                                    />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout} label="本科毕业年份"
                                >
                                {getFieldDecorator('universityGraduateYear', {
                                    initialValue: dataBind(this.state.dataModel.universityGraduateYear),
                                    rules: [{
                                        required: true, message: '请选择!',
                                    }],
                                })(
                                    <Input placeholder='请输入毕业年份' />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'高中毕业院校省市'}>
                                {getFieldDecorator('highSchoolAreaId', {
                                    initialValue: this.state.dataModel.highSchoolAreaId,
                                    // rules: [{ required: item.required, message: '请选择' + item.title + '!' }],
                                    })(
                                    <AreasSelect
                                        value={this.state.dataModel.highSchoolAreaId}
                                        areaName={this.state.dataModel.highSchoolAreaName}
                                    />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label={'高中毕业院校名'}
                                >
                                {getFieldDecorator('highSchool',{
                                    initialValue:this.state.dataModel.highSchool,
                                })(
                                    <Input placeholder='请输入高中毕业院校名'/>
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label={'就业城市'}
                                >
                                {getFieldDecorator('areaId',{
                                    initialValue:this.state.dataModel.areaId,
                                    rules:[{ required:true,message:'请输入就业城市'}]
                                })(
                                    <AreasSelect
                                        value={this.state.dataModel.areaId}
                                        areaName={this.state.dataModel.areaName}
                                    />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label={'在职单位'}
                                >
                                {getFieldDecorator('workCompany',{
                                    initialValue:this.state.dataModel.workCompany
                                })(
                                    <Input placeholder='请输入在职单位' />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label={'职位'}
                                >
                                {getFieldDecorator('workJob',{
                                    initialValue:this.state.dataModel.workJob,
                                    // rules:[{ required:true,message:'123'}]
                                })(
                                    <Input placeholder='请输入职位' />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'入职日期'}>
                                {
                                    getFieldDecorator('workDate', {
                                    initialValue: dataBind(timestampToTime(this.state.dataModel.workDate), true), 
                                    })(
                                    <DatePicker
                                        format={dateFormat}
                                        placeholder='入职日期'
                                        //onChange={(date, dateString) => this.onDateChange(date, dateString, item.name)}
                                    />
                                    )
                                }
                                </FormItem>
                            </Col>
                            </div>:<div>
                            <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label={'在职院校'}
                            >
                                {
                                getFieldDecorator('studyUniversityId', { 
                                initialValue: (!this.state.dataModel.studyUniversityName ? [] : [{
                                    id: this.state.dataModel.studyUniversityId,
                                    name: this.state.dataModel.studyUniversityName
                                  }]),
                                rules: [{
                                    required: true, message: '请输入在职院校',
                                }]
                                })(
                                    <div>
                                        {this.state.tags.map((tag, index) => {
                                            const isLongTag = tag.universityName.length > 20;
                                            const tagElem = (
                                                <Tag value={tag.universityId} key={tag.universityId} closable afterClose={() => this.handleClose(tag)}>
                                                    {isLongTag ? `${tag.universityName.slice(0, 20)}...` : tag.universityName}
                                                </Tag>
                                            );
                                            return isLongTag ? <Tooltip title={tag.universityName}>{tagElem}</Tooltip> : tagElem;
                                        })}
                                        {this.state.inputVisible && (
                                            <AutoComplete
                                                dataSource={this.state.dataSource.map(this.renderOption)}
                                                onSelect={this.onSelect}
                                                onSearch={this.handleSearch}
                                                placeholder="支持名称模糊搜索"
                                            />
                                        )}
                                      </div>
                                )
                            }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label={'在读院校/校区'}
                            >
                                {
                                    getFieldDecorator('studyCampusId', {
                                    initialValue: this.state.dataModel.studyCampusId, 
                                    rules: [{
                                        required: true, message: '请选择在读院校/校区',
                                    }]
                                    })(
                                        <Select>
                                            {
                                                this.state.bz_campus_list.map(item=>{
                                                    return <Option value={item.value}>{item.title}</Option>
                                                })
                                            }
                                        </Select>
                                    )
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label={'院系'}
                            >
                                {
                                    getFieldDecorator('studyDepartment', {
                                    initialValue: this.state.dataModel.studyDepartment,
                                    rules: [{
                                        required: true, message: '请输入院系',
                                    }]
                                    })(
                                       <Input placeholder='请输入院系'/>
                                    )
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label={'专业'}
                            >
                                {
                                    getFieldDecorator('studySpecialty', {
                                    initialValue: this.state.dataModel.studySpecialty,
                                    rules: [{
                                        required: true, message: '请输入专业',
                                    }]
                                    })(
                                        <Input placeholder='请输入专业'/>
                                    )
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label={'入学年份'}
                            >
                                {
                                    getFieldDecorator('studyUniversityEnterYear', {
                                    initialValue: this.state.dataModel.studyUniversityEnterYear,
                                    rules: [{
                                        required: true, message: '请输入入学年份',
                                    }]
                                    })(
                                        <Input placeholder='请输入入学年份'/>
                                    )
                                }
                            </FormItem>
                        </Col>
                            </div>
                        } 
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                label={'学生备注'}
                            >
                            {
                                getFieldDecorator('otherMark',{ 
                                    initialValue:this.state.dataModel.otherMark,
                                    // rules:[{required: true, message: '请选择' }]
                                })(
                                    <TextArea />
                                )
                            }
                            </FormItem>
                        </Col>
                        <Col span={24} className='formTitle' >
                            <FormItem {...(searchFormItemLayout24)} label={'学生联系方式'}>
                                <div>{}</div>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='手机'
                            >
                                {getFieldDecorator('mobile',{ 
                                    initialValue:this.state.dataModel.mobile,
                                    rules:[{ required:true,message: '请输入手机号'}]
                                })(
                                    <Input placeholder='请输入手机号'/>
                                )}
                            </FormItem>
                        </Col> 
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='电子邮箱'
                            >
                                {getFieldDecorator('email',{ 
                                    initialValue:this.state.dataModel.email,
                                    rules:[{ required:true,message: '请输入电子邮箱'}]
                                })(
                                    <Input placeholder='请输入电子邮箱'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='微信'
                            >
                                {getFieldDecorator('weixin',{ 
                                    initialValue:this.state.dataModel.weixin,
                                    rules:[{ required:true,message: '请输入微信'}]
                                })(
                                    <Input placeholder='请输入微信'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='QQ'
                            >
                                {getFieldDecorator('qq',{ 
                                    initialValue:this.state.dataModel.qq,
                                    rules:[{ required:true,message: '请输入QQ'}]
                                })(
                                    <Input placeholder='请输入QQ'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='紧急联系人姓名'
                            >
                                {getFieldDecorator('emergencyContactName',{ 
                                    initialValue:this.state.dataModel.emergencyContactName,
                                    rules:[{ required:true,message: '请输入紧急联系人姓名'}]
                                })(
                                    <Input placeholder='请输入紧急联系人姓名'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='紧急联系人姓名电话'
                            >
                                {getFieldDecorator('emergencyContactPhone',{ 
                                    initialValue:this.state.dataModel.emergencyContactPhone,
                                    rules:[{ required:true,message: '请输入紧急联系人姓名电话'}]
                                })(
                                    <Input placeholder='请输入紧急联系人姓名电话'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='与紧急联系人关系'
                            >
                                {getFieldDecorator('emergencyContactType',{ 
                                    initialValue:dataBind(this.state.dataModel.emergencyContactType),
                                    rules:[{ required:true,message: '请选择'}]
                                })(
                                   <Select>
                                       {/* <Option value='0'>--请选择--</Option> */}
                                       <Option value='1'>父母</Option>
                                       <Option value='2'>其他</Option>
                                   </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='通讯地址'
                            >
                                {getFieldDecorator('address',{ 
                                    initialValue:this.state.dataModel.address,
                                    // rules:[{ required:true,message: '请输入通讯地址'}]
                                })(
                                    <Input placeholder='请输入通讯地址'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24} className='formTitle' >
                            <FormItem {...(searchFormItemLayout24)} label={'学生扩展信息'}>
                                <div>{}</div>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='ACCA学生号'
                            >
                                {getFieldDecorator('accaStudentName',{ 
                                    initialValue:this.state.dataModel.accaStudentName,
                                    // rules:[{ required:true,message: '请输入ACCA学生号'}]
                                })(
                                    <Input placeholder='请输入ACCA学生号'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='ACCA注册类型'
                            >
                                {getFieldDecorator('certificateRegType',{ 
                                    initialValue:dataBind(this.state.dataModel.certificateRegType),
                                    // rules:[{ required:true,message: '请输入通讯地址'}]
                                })( 
                                    <Select>
                                        <Option value=''>--请选择--</Option>
                                        <Option value='1'>acca</Option>
                                        <Option value='2'>fia</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='IMA会员号'
                            >
                                {getFieldDecorator('memberName',{ 
                                    initialValue:this.state.dataModel.memberName,
                                    // rules:[{ required:true,message: '请输入IMA会员号'}]
                                })(
                                    <Input placeholder='请输入IMA会员号'/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                label='实习情况'
                            >
                                {getFieldDecorator('internshipSituation',{ 
                                    initialValue:this.state.dataModel.internshipSituation,
                                    // rules:[{ required:true,message: '请输入IMA会员号'}]
                                })(
                                    <TextArea placeholder='请输入实习情况'/>
                                )}
                            </FormItem>
                        </Col>
                    </Row> 
                </Form>
            ); 

        return (
            <div>
                {!this.state.showList && <ContentBox titleName={'学生扩展信息管理'} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(Detail);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch), 
        allUniversityList: bindActionCreators(allUniversityList, dispatch),
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch), 
        //查询接口
        getStudentById: bindActionCreators(getStudentById, dispatch),
        //编辑保存
        ResultInputEdit: bindActionCreators(ResultInputEdit, dispatch),
        //验证学生各项信息
        studentCheck: bindActionCreators(studentCheck, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
