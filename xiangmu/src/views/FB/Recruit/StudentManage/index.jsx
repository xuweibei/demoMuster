/*
招生管理 > 活动与咨询 > 学生管理
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider ,DatePicker} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
const { RangePicker } = DatePicker;
//基本字典接口方法引入
import { loadDictionary, systemCommonChild } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind, formatMoment } from '@/utils';

//业务接口方法引入
import FileDownloader from '@/components/FileDownloader';
import { getCampusByUniversityId } from '@/actions/base';
import { studentQuery, editAdjustBranch, exportStudent, studentCreateInActive, studentUpdateInActive } from '@/actions/recruit';
import { editUser } from '@/actions/recruit';
import { editAreaByAreaId } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import View from './View';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
import EditableActive from '@/components/EditableActive';

import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

import StudentEdit from '../OrderCreate/student';

class StudentManage extends React.Component {

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        let timeArr = timestampToTime(new Date().getTime()).split('-');
        let nowYear = timeArr[0];
        let studyUniversityEnterYear = [];
        for(var i=0; i<20; i++){
            studyUniversityEnterYear.push({ title: (nowYear-i), value: (nowYear-i) })
        }
        this.state = {
            showHideOnOff:false,
            showHide:'展开',
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regRegionId: '',
                studyUniversityId: '',
                studyCampusId: '',
                realName: '',
                certificateNo: '',
                mobile: '',
                isStudy: '',
                weixin: '',
                qq: '',
                benefitMarketUserName: '',
                benefitPconsultUserName: '',
                benefitFconsultUserName:'',
                regSource: '',
                studyUniversityName:'',
                grade:'',
                orderTypes:'',
                createDateStart:'',
                createDateEnd:'',
                isPublic: '',
                askSource: '',
                askDateStart:'',
                askDateEnd:'',
            },
            UserSelecteds: [],
            data: [],
            dic_University: [],
            dic_Campus: [],
            totalRecord: 0,
            loading: false,
            isStudy: false,
            startValue: null,
            endValue: null,
            activeIdData: [],
            submitLoading: false,
            studyUniversityEnterYear: studyUniversityEnterYear,//入学年份列表
        };

    }
    componentDidMount(){
        document.addEventListener("keydown",this.handleEnterKey);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown",this.handleEnterKey);
    }
    handleEnterKey = (e) => {
        if(e.keyCode === 13){
            this.onSearch();
        }
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['reg_source']);
        this.loadBizDictionary(['dic_Status', 'sex', 'is_study','dic_YesNo','ask_source']);
        this.loadBizDictionary(['grade']);
        this.loadBizDictionary(['reg_source_child']);
        //首次进入搜索，加载服务端字典项内容

        // this.onSearch();
    }
    
    //检索数据
    fetch = (params) => {

        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;

        if (condition.studyUniversityId && condition.studyUniversityId.length > 0) {
            condition.studyUniversityId = condition.studyUniversityId[0].id
        }
        if (condition.activeId && condition.activeId.length > 0) {
            this.setState({ activeIdData: condition.activeId })
            condition.activeId = condition.activeId[0].id
        }
        
        let createDateStart = condition.createDateStart;
        if (createDateStart) {
            condition.createDateStart = formatMoment(createDateStart[0]);
            condition.createDateEnd = formatMoment(createDateStart[1]);
        }
        let askDate = condition.askDateStart;
        if (askDate) {
            condition.askDateStart = formatMoment(askDate[0]);
            condition.askDateEnd = formatMoment(askDate[1]);
        }

        this.props.studentQuery(condition).payload.promise.then((response) => {

            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
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
        return endValue.valueOf() <= startValue.valueOf();
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

    //检索校区列表数据
    fetchCampusList = (universityId) => {
        let condition = { currentPage: 1, pageSize: 999, universityId: universityId };
        this.props.getCampusByUniversityId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_Campus: data.data.map((a) => { return { title: a.campusName, value: a.campusId.toString() } }) });
            }
        })
    }

    //table 输出列定义
    columns = [{
        title: '所属区域',
        fixed: 'left',
        width: 150,
        dataIndex: 'regRegionName',
    },
    {
        title: '市场人员',
        dataIndex: 'benefitMarketUserName'
    },
    {
        title: '电咨人员',
        dataIndex: 'benefitPconsultUserName'
    },
    {
        title: '面咨人员',
        dataIndex: 'benefitFconsultUserName'
    },
    {
        title: '学生姓名',
        dataIndex: 'realName',
        render: (text, record, index) => {
            return <a onClick={() => {
                this.onStudentView(record)
            }}>{record.realName}</a>;
        }
    },
    {
        title: '性别',
        dataIndex: 'gender',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.sex, record.gender);
        }
    },
    {
        title: '活动名称',
        dataIndex: 'activityName',
    },
    {
        title: '学生来源',
        dataIndex: 'regSource',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.reg_source, record.regSource)+'  '+(record.subRegSource ? getDictionaryTitle(this.state.reg_source_child, record.subRegSource):'');
        }
    },
    {
        title: '目前情况',
        dataIndex: 'isStudy',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.is_study, record.isStudy);
        }
    },

    {
        title: '在读高校',
        dataIndex: 'studyUniversityName',
    },
    {
        title: '入学年份',
        dataIndex: 'studyUniversityEnterYear'
    },
    {
        title: '证件号',
        dataIndex: 'certificateNo'
    },
    {
        title: '手机',
        dataIndex: 'mobile'
    },
    {
        title: '微信',
        dataIndex: 'weixin'
    },
    {
        title: 'QQ',
        dataIndex: 'qq'
    },
    {
        title: '邮箱',
        dataIndex: 'email'
    },
    {
        title: '意向等级',
        dataIndex: 'grade',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.grade, record.grade);
        }
    },
    {
        title: '订单状态',
        dataIndex: 'orderStatus',
        render: (text, record, index) => {
          switch (record.orderStatus) {
            case 0:
              return "无订单";
            case 1:
              return "已下单未缴费";
            case 2:
              return "已下单已缴费";
            default:
              return "无订单";
          }
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        render: (text, record, index) => {
          return this.createTimestampToTime(record.createDate)
        }
      },
      {
        title: '名片词',
        dataIndex: 'bcWord'
    },
    {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right',
        render: (text, record) => (
            <div>
                <Button onClick={() => { this.onLookView('EditByStudentManage', record); }}>编辑</Button>
            </div>
        ),
    }
    ];
    createTimestampToTime=(timestamp) =>{
        if(!timestamp)return
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        var D = date.getDate() + ' ';
        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        return Y+M+D+this.tab(h) + ':'+this.tab(m)+ ':'+this.tab(s);
    }
    tab = (n)=>{
        return n<10?'0'+n:n;
    }

    handleTableChange = (pagination, filters, sorter) => {
        //const pager = this.state.pagingSearch;
        //pager.currentPage = pagination.current;
        //this.setState({ pagination: pager });
        this.fetch({
            results: pagination.pageSize,
            currentPage: pagination.currentPage,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters,
        });
    }

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setSubmitLoading(false);
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case 'CreateByStudentManage':
                //case 'CreateByOrderCreate':
                    this.props.studentCreateInActive(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        this.setSubmitLoading(false);
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success("新增学生成功");
                            this.fetch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;

                case "EditByStudentManage": //提交
                    this.props.studentUpdateInActive(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        this.setSubmitLoading(false);
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            message.success("修改学生成功");
                            this.fetch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;

                case 'editArea':
                    this.props.editAreaByAreaId(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                default:
                    this.props.editUser(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [] });
                            this.onSearch();
                            this.onLookView("Manage", null);
                        }
                    })
                    break;

            }
        }
    }
    onStudentView = (record) => {
        this.onLookView("View", record)
    }
    oneditArea = () => {
        let params = { orderIds: this.state.UserSelecteds }
        this.onLookView("editArea", params)
    }
    oneditmUser = () => {
        let params = { orderIds: this.state.UserSelecteds, type: 1 }
        this.onLookView("editmUser", params)
    }
    oneditpUser = () => {
        let params = { orderIds: this.state.UserSelecteds, type: 2 }
        this.onLookView("editpUser", params)
    }
    oneditfUser = () => {
        let params = { orderIds: this.state.UserSelecteds, type: 3 }
        this.onLookView("editfUser", params)
    }

    onBatchEdit(type, title) {
        this.onLookView("Edit", { ids: this.state.UserSelecteds, type: type, title: title })
    }

    setSubmitLoading = (flag) => {
       this.setState({ submitLoading: flag })
    }
    showHideFN = () =>{
        let title = '';
        let onOff = false;
        if(this.state.showHideOnOff){
            title = '展开';
            onOff = false;
        }else{
            onOff = true;
            title = '收起';
        }
        this.setState({
            showHideOnOff:onOff,
            showHide:title
        })
    }
    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };
        switch (this.state.editMode) {
            case 'CreateByStudentManage':
                block_content = <StudentEdit
                    viewCallback={this.onViewCallback}
                    setSubmitLoading={this.setSubmitLoading}
                    editMode={this.state.editMode}
                    onNextView={this.onNextView}
                    {...this.state}
                />
                break;
            case "View":
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                break;
            case 'EditDate':
            case 'EditByStudentManage':
                block_content = <StudentEdit
                    viewCallback={this.onViewCallback}
                    setSubmitLoading={this.setSubmitLoading}
                    editMode={this.state.editMode}
                    studentId={this.state.currentDataModel.studentId}
                    onNextView={this.onNextView}
                    {...this.state}
                />
                break;
            case 'editmUser':
            case 'editpUser':
            case 'editfUser':
            case 'editArea':
                block_content = <View
                    viewCallback={this.onViewCallback}
                    {...this.state}

                />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('CreateByStudentManage') }
                } icon="plus" className="button_dark" > 新增学生</Button>);
                extendButtons.push(<Button onClick={() => { this.showHideFN() }
                } icon={this.state.showHideOnOff?'caret-up':'caret-down'} className="button_dark" > 搜索条件{this.state.showHide}</Button>);

                //导出按钮暂时屏蔽
                // extendButtons.push(
                //     <FileDownloader
                //         apiUrl={'/edu/student/exportStudent'}//api下载地址
                //         method={'get'}//提交方式
                //         options={this.state.pagingSearch}//提交参数
                //         title={'导出'}
                //     >
                //     </FileDownloader>);
                const prefixSelector = getFieldDecorator('textKey', {
                    initialValue: dataBind(this.state.textKey || 'realName'),
                  })(
                    <Select style={{ width: 70 }} onChange={this.onCountryChange}>
                      <Option value='realName'>姓名</Option>
                      <Option value='loginName'>工号</Option>
                    </Select>
                    );
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                <Input placeholder="请输入手机号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'证件号'} >
                                            {getFieldDecorator('certificateNo', { initialValue: this.state.pagingSearch.certificateNo })(
                                                <Input placeholder="请输入证件号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'在读高校'} >
                                            {getFieldDecorator('studyUniversityName', { initialValue: this.state.pagingSearch.studyUniversityName })(
                                                <Input placeholder="在读高校" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'学生来源'} >
                                            {getFieldDecorator('regSource', { initialValue: this.state.pagingSearch.regSource })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.reg_source.map((item, index) => {
                                                        return <Option title={item.title} value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem {...searchFormItemLayout} label="学生订单情况" >
                                            {getFieldDecorator('orderTypes', { initialValue: this.state.pagingSearch.orderTypes })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    <Option title="无订单" value="0" key="0">无订单</Option>
                                                    <Option title="已下单未缴费" value="1" key="1">已下单未缴费</Option>
                                                    <Option title="已下单已缴费" value="2" key="2">已下单已缴费</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'区域'} >
                                            {getFieldDecorator('regRegionId', { initialValue: this.state.pagingSearch.regRegionId })(
                                                <SelectArea scope='my' hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="目前情况"
                                        >
                                            {getFieldDecorator('isStudy', { initialValue: this.state.pagingSearch.isStudy })(
                                                <Select
                                                    onChange={(value)=>{
                                                        if(value == 1){
                                                            this.setState({
                                                                isStudy: true
                                                            })
                                                        }else{
                                                            this.setState({
                                                                isStudy: false
                                                            })
                                                        }
                                                    }}>
                                                    <Option value="">全部</Option>
                                                    <Option value='1' key='1'>在读</Option>
                                                    <Option value='0' key='0'>在职</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        this.state.isStudy ?
                                        <Col span={8} >
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="在读院校/校区"
                                            ><div className='flex-row'>
                                                    {getFieldDecorator('studyUniversityId', { initialValue: dataBind(this.state.pagingSearch.studyUniversityId) })(

                                                        <EditableUniversityTagGroup maxTags={1} onChange={(value) => {
                                                            if (value.length > 0) {
                                                                let id = value[0].id
                                                                this.fetchCampusList(id);
                                                            }
                                                            else {
                                                                this.setState({ dic_Campus: [] })
                                                            }
                                                            setTimeout(() => {
                                                                this.props.form.resetFields(['studyCampusId']);
                                                            }, 500);
                                                        }} />

                                                    )}
                                                    <div className='split_button'></div>
                                                    {getFieldDecorator('studyCampusId', { initialValue: dataBind(this.state.pagingSearch.studyCampusId) })(
                                                        <Select>
                                                            {this.state.dic_Campus.map((item, index) => {
                                                                return <Option title={item.title} value={item.value} key={index}>{item.title}</Option>
                                                            })}
                                                        </Select>
                                                    )}
                                                </div>
                                            </FormItem>
                                        </Col>
                                        :
                                        ''
                                    }
                                    {
                                        this.state.isStudy ? <Col span={8} >
                                            <FormItem {...searchFormItemLayout} label="入学年份" >
                                                {getFieldDecorator('studyUniversityEnterYear', { initialValue: '' })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.studyUniversityEnterYear.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        : ''
                                    }
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'微信'} >
                                            {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                                                <Input placeholder="请输入微信" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        this.state.showHideOnOff && <div>
                                    
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'QQ'} >
                                            {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                                                <Input placeholder="请输入QQ" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'邮箱'} >
                                            {getFieldDecorator('email', { initialValue: this.state.pagingSearch.email })(
                                                <Input placeholder="请输入邮箱" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    

                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'市场人员'} >
                                            {getFieldDecorator('benefitMarketUserName', { initialValue: this.state.pagingSearch.benefitMarketUserName })(
                                                <Input placeholder="请输入市场人员" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'面咨人员'} >
                                            {getFieldDecorator('benefitFconsultUserName', { initialValue: this.state.pagingSearch.benefitFconsultUserName })(
                                                <Input placeholder="请输入面咨人员" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'电咨人员'} >
                                            {getFieldDecorator('benefitPconsultUserName', { initialValue: this.state.pagingSearch.benefitPconsultUserName })(
                                                <Input placeholder="请输入电咨人员" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    

                                    <Col span={8} >
                                        <FormItem {...searchFormItemLayout}
                                            label="活动名称">
                                            {getFieldDecorator('activeId', { initialValue: (!this.state.activeIdData.length ? [] : [{
                                                id: this.state.activeIdData[0].id,
                                                name: this.state.activeIdData[0].name
                                              }]) })(
                                                <EditableActive  maxTags={1}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {//线下分部
                                        (this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) ? <Col span={8} >
                                            <FormItem {...searchFormItemLayout}
                                                label="是否公海">
                                                {getFieldDecorator('isPublic', { initialValue: this.state.pagingSearch.isPublic })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.dic_YesNo.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        : ''
                                    }
                                    <Col span={8}>
                                        <FormItem
                                        {...searchFormItemLayout}
                                        label="创建人"
                                        >
                                        {getFieldDecorator('textValue', {
                                            initialValue: this.state.pagingSearch.textValue,
                                        })(
                                            <Input style={{width:170}} addonBefore={prefixSelector}
                                            />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'咨询来源'} >
                                            {getFieldDecorator('askSource', { initialValue: this.state.pagingSearch.askSource })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.ask_source.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                                            {getFieldDecorator('grade', { initialValue:this.state.pagingSearch.grade })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.grade.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        (this.state.isStudy && this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType != 2) ? <Col span={8}></Col> : ''
                                    }
                                    <Col span={8}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="咨询日期">
                                            {getFieldDecorator('askDateStart', { initialValue: this.state.pagingSearch.askDateStart?[moment(this.state.pagingSearch.askDateStart,dateFormat),moment(this.state.pagingSearch.askDateEnd,dateFormat)]:[] })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        (!this.state.isStudy && this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) ? <Col span={8}></Col> : ''
                                    }
                                    <Col span={8} >
                                        <FormItem {...searchFormItemLayout}
                                            label="创建日期">
                                            {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart),moment(this.state.pagingSearch.createDateEnd)]:[] })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    
                                    <Col span={8}>
                                    
                                    </Col>
                                    <Col span={8}>
                                    
                                    </Col>
                                    </div>
                                    }
                                </Row>
                            </Form>
                        }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    {/* 数据表格 */}
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            rowKey={'studentId'}
                            // rowSelection={rowSelection}
                            dataSource={this.state.data}//数据
                            onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: 2300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">

                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className={'search-paging-control'} align="right">
                                    <Pagination showSizeChanger
                                        current={this.state.pagingSearch.currentPage}
                                        defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.onPageIndexChange}
                                        showTotal={(total) => { return `共${total}条数据`; }}
                                        total={this.state.totalRecord} />
                                </Col>
                            </Row>
                        </div> 
                    </div>
                </div>);
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedAscriptionManage = Form.create()(StudentManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { currentUser } = state.auth;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        systemCommonChild: bindActionCreators(systemCommonChild, dispatch),
        //各业务接口
        studentQuery: bindActionCreators(studentQuery, dispatch),//列表查询接口
        exportStudent: bindActionCreators(exportStudent, dispatch),//导出接口
        studentCreateInActive: bindActionCreators(studentCreateInActive, dispatch),//新增学生接口
        studentUpdateInActive: bindActionCreators(studentUpdateInActive, dispatch),//编辑学生接口
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
        editAdjustBranch: bindActionCreators(editAdjustBranch, dispatch),
        editAreaByAreaId: bindActionCreators(editAreaByAreaId, dispatch),
        editUser: bindActionCreators(editUser, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAscriptionManage);
