//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table,
    Pagination, Divider, InputNumber, DatePicker, Modal
} from 'antd';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
import moment from 'moment';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import FileDownloader from '@/components/FileDownloader';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoment } from '@/utils';

//业务接口方法引入
import { getItemList, addItem, editItem } from '@/actions/base';
import { getStudentAskP2List, delAsk, updAskP } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
//import ItemView from '../ItemView';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import AskPView from '../StudentAskPManage/askPView.jsx';
import DaoRuP from '../StudentAskPManage/daoRuP.jsx';
import EditableActive from '@/components/EditableActive';
import DropDownButton from '@/components/DropDownButton';



class StudentAskPManage extends React.Component {

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
            visible:false,
            showHide:false,
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regRegionId: '',
                studentId: '',
                studentAskId: '',
                askType: 1,//电咨类型
                nextAskDateStart:'',
                nextAskDateEnd:'',
                userCreateDateStart:'',
                userCreateDateEnd:'',
                askDateStart:'',
                askDateEnd:'',
                realName:'',
                regSource:'',
                grade:'',
                orderStatus:'',
                mobile:'',
                weixin:'',
                qq:'',
                numberOfDaysAgo:'',
                isPublic: ''
            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            onOff:true,
            activeIdData: [],
            studyUniversityEnterYear: studyUniversityEnterYear,//入学年份列表
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['reg_source','grade','dic_YesNo']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch(); 
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
    
    componentDidUpdate(){
        if(this.state.editMode =='Manage' && !this.state.onOff){
            this.props.details(true,'0');
            this.setState({onOff:true})
        }
    }

    handleCancel = (e) => { 
        this.setState({
          visible: false,
        });
      }
    //table 输出列定义
    columns = [
        {
            title: '学生姓名',
            fixed: 'left',
            width: 120,
            dataIndex: 'studentName',
            render: (text, record, index) => {
                return <a onClick={() => {
                  this.onStudentView(record) 
                }}>{record.realName}</a>;
              }
        },
        {
            title: '在读高校',
            dataIndex: 'universityName'
        },
        {
            title: '手机号',
            dataIndex: 'mobile'
        },
        {
            title: '微信号',
            dataIndex: 'weixin'
        },
        {
            title: 'QQ',
            dataIndex: 'qq'
        },
        {
            title: '电咨日期',
            dataIndex: 'askDate',
            render: (text, record, index) => {
                return timestampToTime(record.askDate)
            },
        },
        {
            title: '电咨内容',
            dataIndex: 'askContent'
        },
        {
            title: '邀约面咨日期',
            dataIndex: 'inviteDate',
            render: (text, record, index) => {
                return timestampToTime(record.inviteDate)
            },
        },
        {
            title: '咨询人',
            dataIndex: 'createUserName'
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (text, record) => {
                return <DropDownButton>
                    <Button onClick={() => {
                        this.onLookView('Edit', {
                            studentId: record.studentId,
                            studentAskId: record.studentAskId
                        })
                    }}>编辑</Button>
                    <Button onClick={() => {
                        this.onLookView('View', {
                            studentId: record.studentId,
                            studentAskId: record.studentAskId
                        })
                    }}>查看</Button>
                </DropDownButton>
            }
        }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.currentPage = condition.currentPage;//修正分页参数  
        let askDateStart;
        let askDateEnd;
        let askDate = condition.askDateStart;
        let nextAskDate = condition.nextAskDateStart;
        let userCreateDateStart = condition.userCreateDateStart;
        if (askDate) {
            condition.askDateStart = formatMoment(askDate[0]);
            condition.askDateEnd = formatMoment(askDate[1]);
        }
        if(nextAskDate){
            condition.nextAskDateStart = formatMoment(nextAskDate[0]);
            condition.nextAskDateEnd = formatMoment(nextAskDate[1]);
        }
        if(userCreateDateStart){
            condition.userCreateDateStart = formatMoment(userCreateDateStart[0]);
            condition.userCreateDateEnd = formatMoment(userCreateDateStart[1]);
        }

        if (condition.activeId && condition.activeId.length > 0) {
            this.setState({ activeIdData: condition.activeId })
            condition.activeId = condition.activeId[0].id
        }

        this.props.getStudentAskP2List(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = []
                data.data = data.data || []
                data.data.map(item => {
                    item.key = item.studentAskId;
                    list.push(item);
                })
                this.setState({
                    data_list: list,
                    totalRecord: data.totalRecord,
                    loading: false,
                    pagingSearch: condition,
                })
            }
            else {
                this.setState({ loading: false, data_list: [] })
                message.error(data.message);
            }
        })
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
    //删除
    onBatchDelete = () => {
        //获取学生ids数组
        var studentIdslist = [];
        this.state.UserSelecteds.map(courseArrangeStudentId => {
            studentIdslist.push(courseArrangeStudentId)
        })

        Modal.confirm({
            title: '确认删除?',
            content: '点击确认删除!否则点击取消！',
            onOk: () => {
                this.props.delAsk({ ids: studentIdslist.join(",") }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        this.setState({ UserSelecteds: [] })
                        this.onSearch();
                    }
                })
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });

    }
    onStudentView = (record) => { 
        this.setState({
            visible:true,
            onOff:true,
            currentDataModel:record
        })
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
            this.setState({ currentDataModel: null, editMode: 'Manage',onOff:false })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.addItem(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case "Edit": //提交
                    dataModel.askDate = formatMoment(dataModel.askDate);
                    dataModel.inviteDate = formatMoment(dataModel.inviteDate);
                    dataModel.nextAskDate = formatMoment(dataModel.nextAskDate);
                    this.props.updAskP(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'faceView':
                    this.onLookView("Manage", null);
                    break;

            }
        }
    }
    showHideFN = () =>{ 
        let { showHide } = this.state;
        this.setState({ 
            showHide:!showHide
        })
    }
    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        console.log(this.state.editMode)
        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <AskPView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "DaoRuP":
                block_content = <DaoRuP viewCallback={this.onViewCallback} {...this.state} />
                break;
            case 'faceView':
                block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
                break;
            case "Manage":
            default:
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: record.auditStatus > 0, // Column configuration not to be checked            
                    }),
                }
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('DaoRuP', {}) }} icon="download" className="button_dark">
                    导入电咨信息</Button>);
                //除查询外，其他扩展按钮数组
                extendButtons.push(<FileDownloader
                    apiUrl={'/edu/studentAsk/exportStudentAsk'}//api下载地址
                    method={'post'}//提交方式
                    options={this.state.pagingSearch}//提交参数
                    title={'导出电咨信息'}
                ></FileDownloader>);
                extendButtons.push(<Button onClick={() => { this.showHideFN() }
                } icon={this.state.showHide?'caret-up':'caret-down'} className="button_dark" > 搜索条件{this.state.showHide?'收起':'展开'}</Button>);

                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form className="search-form" >

                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="学生姓名" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                <Input placeholder="手机号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'区域'} >
                                            {getFieldDecorator('regRegionId', { initialValue: this.state.pagingSearch.regRegionId })(
                                                <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout} label="学生来源" >
                                            {getFieldDecorator('regSource', { initialValue: this.state.pagingSearch.regSource })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.reg_source.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                                            {getFieldDecorator('grade', { initialValue: this.state.pagingSearch.grade })(
                                                <Select>
                                                    <Option value="">请选择</Option>
                                                    {this.state.grade.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout} label="学生订单情况" >
                                            {getFieldDecorator('orderStatus', { initialValue: this.state.pagingSearch.orderStatus })(
                                                <Select>
                                                    <Option value="">请选择</Option>
                                                    <Option value="0" key="0">无订单</Option>
                                                    <Option value="1" key="1">已下单未缴费</Option>
                                                    <Option value="2" key="2">已下单已缴费</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        this.state.showHide && <div>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'微信'} >
                                            {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                                                <Input placeholder="微信" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label={'QQ'} >
                                            {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                                                <Input placeholder="QQ" />
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="咨询日期">
                                            {getFieldDecorator('askDateStart', { initialValue:this.state.pagingSearch.askDateStart?[moment(this.state.pagingSearch.askDateStart,dateFormat),moment(this.state.pagingSearch.askDateEnd,dateFormat)]:[] })(
                                                <RangePicker style={{ width: 220 }} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="下次咨询日期">
                                            {getFieldDecorator('nextAskDateStart', { initialValue:this.state.pagingSearch.nextAskDateStart?[moment(this.state.pagingSearch.nextAskDateStart,dateFormat),moment(this.state.pagingSearch.nextAskDateEnd,dateFormat)]:[]})(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem {...searchFormItemLayout}
                                            label="首次活动名称">
                                            {getFieldDecorator('activeId', { initialValue: (!this.state.activeIdData.length ? [] : [{
                                                id: this.state.activeIdData[0].id,
                                                name: this.state.activeIdData[0].name
                                            }]) })(
                                                <EditableActive  maxTags={1}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="学生创建日期">
                                            {getFieldDecorator('userCreateDateStart', { initialValue: this.state.pagingSearch.userCreateDateStart?[moment(this.state.pagingSearch.userCreateDateStart,dateFormat),moment(this.state.pagingSearch.userCreateDateEnd,dateFormat)]:[] })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
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
                                    {//线下分部
                                        (this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) && <Col span={12} >
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
                                    }
                                    {
                                        (this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) && <Col span={12} >
                                        </Col>
                                    }
                                    <Col span={12} ></Col></div>
                                    }
                                </Row>
                            </Form>
                        }
                    </ContentBox>
                    {/* 内容分割线 */}
                    <div className="space-default"></div> 
                    {
                        this.state.visible && <Modal
                        title=""
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        footer = {null}
                        width={1000}
                      >
                            <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} goBack={true}/>
                      </Modal>
                    }
                    {/* 数据表格 */}
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            pagination={false}
                            dataSource={this.state.data_list}//数据
                            onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: 1300 }}
                            rowSelection={rowSelection}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={4}>
                                    <div className='flex-row'>
                                        {(this.state.UserSelecteds.length > 0) ?
                                            <Button onClick={this.onBatchDelete} icon='delete'>删除</Button> :
                                            <Button disabled icon='delete'>删除</Button>
                                        }
                                    </div>
                                </Col>
                                <Col span={20} className='search-paging-control'>
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
const WrappedStudentAskPManage = Form.create()(StudentAskPManage);

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
        //各业务接口
        getItemList: bindActionCreators(getItemList, dispatch),
        addItem: bindActionCreators(addItem, dispatch),
        editItem: bindActionCreators(editItem, dispatch),
        getStudentAskP2List: bindActionCreators(getStudentAskP2List, dispatch),
        delAsk: bindActionCreators(delAsk, dispatch),
        updAskP: bindActionCreators(updAskP, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentAskPManage);
