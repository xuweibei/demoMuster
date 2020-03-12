//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider ,DatePicker} from 'antd';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
const { Option, OptGroup } = Select;

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind,formatMoney, formatMoment } from '@/utils';
import moment from 'moment';
//业务接口方法引入 
import { getCampusByUniversityId,queryAllBranch,UserSourceDivision } from '@/actions/base';
import { getFBAdjustBranchList, editAdjustBranch } from '@/actions/recruit';
import { editUser } from '@/actions/recruit';
import { editAreaByAreaId } from '@/actions/recruit';
import { changeTeachCenter } from '@/actions/enrolStudent';
//业务数据视图（增、删、改、查)
import View from './View';
import EditBranch from './editBranch';
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
import EditableActive from '@/components/EditableActive';

class AscriptionManage extends React.Component {
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

        this.state = {
            showHide:false,
            all_org_list:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regRegionId: '',
                studyUniversityId: '',
                sourceBranchId:'',
                studyCampusId: '',
                realName: '',
                certificateNo: '',
                mobile: '',
                studyUniversityName: '',
                createDateStart:'',
                createDateEnd:'',
                isStudy: '',
                regSource: '',
                isPublic: '',
                askSource: '',
                grade: '',
                askDateStart:'',
                askDateEnd:'',
            },
            UserSelecteds: [],
            data: [],
            dic_University: [],
            dic_Campus: [],
            totalRecord: 0,
            loading: false,
            startValue: null,
            endValue: null,
            activeIdData: [],
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
        this.loadBizDictionary(['dic_Status', 'sex', 'is_study','dic_YesNo','ask_source','grade']);
        //首次进入搜索，加载服务端字典项内容
        this.UserSource();
        // this.onSearch();
    }
    
     //用户来源分部
   UserSource = () => { 

    this.props.queryAllBranch({state:1}).payload.promise.then((response) => {
      let data = response.payload.data; 
          if(data.state == 'success'){
              let all_org_list = [];
              let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
              //循环
              orderDQList.map((a) => {
              //没有分部
              if (a.organizationList.length == 0) {
                  return;
              }

              let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序
              let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
              orderFBList.map((fb) => {
                  dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
              })
              all_org_list = [...all_org_list, dqItem];
              });
              this.setState({ all_org_list })
          }else{
            message.error(data.msg)
          }
      }
    )
    }
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.currentPage = condition.currentPage;//修正分页参数
        if (condition.studyUniversityId.length > 0) {
            condition.studyUniversityId = condition.studyUniversityId[0].id
        }
        let createDateStart = condition.createDateStart;
        if(createDateStart){
            condition.createDateStart = createDateStart[0];
            condition.createDateEnd = createDateStart[1];
        }
        let askDate = condition.askDateStart;
        if (askDate) {
            condition.askDateStart = formatMoment(askDate[0]);
            condition.askDateEnd = formatMoment(askDate[1]);
        }

        if (condition.activeId && condition.activeId.length > 0) {
            this.setState({ activeIdData: condition.activeId })
            condition.activeId = condition.activeId[0].id
        }

        this.props.getFBAdjustBranchList(condition).payload.promise.then((response) => {
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
        width: 120,
        dataIndex: 'regRegionName',
    },
    {
      title: '用户来源分部',
      width: 120,
      dataIndex: 'sourceBranchName'
    },
    {
        title: '教学点',
        width: 120,
        dataIndex: 'teachCenterName'
    },
    {
        title: '市场人员',
        width: 120,
        dataIndex: 'benefitMarketUserName'
    },
    {
        title: '电咨人员',
        width: 120,
        dataIndex: 'benefitPconsultUserName'
    },
    {
        title: '面咨人员',
        width: 120,
        dataIndex: 'benefitFconsultUserName'
    },
    {
        title: '学生姓名',
        width: 120,
        dataIndex: 'realName'
    },
    {
        title: '性别',
        width: 80,
        dataIndex: 'gender',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.sex, record.gender);
        }
    },
    {
        title: '目前情况',
        width: 80,
        dataIndex: 'isStudy',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.is_study, record.isStudy);
        }
    },
    {
        title: '订单状态',
        width: 100,
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
        title: '在读高校',
        dataIndex: 'studyUniversityName',
    },
    {
        title: '入学年份',
        width: 80,
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
        dataIndex: 'email',
    },
      {
        title: '最新参加活动',
        dataIndex: 'activityName',
    },
    {
        title: '创建时间',
        width: 120,
        fixed: 'right',
        dataIndex: 'createDate',
        render: (text, record, index) => {
          return timestampToTime(record.createDate)
        }
      },
    ];

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
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {

                case "Edit": //提交
                    this.props.editAdjustBranch(dataModel).payload.promise.then((response) => {
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
                    //提交
                    break;
                case 'editArea':
                    this.props.editAreaByAreaId(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [] });
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'editTeachCenter':
                    this.props.changeTeachCenter(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.setState({ UserSelecteds: [] });
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    break;
                case 'EditBranch':
                    this.props.editAdjustBranch(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                        this.setState({ UserSelecteds: [] });
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
    oneditArea = () => {
        let params = { orderIds: this.state.UserSelecteds }
        this.onLookView("editArea", params)
    }
    oneditmUser = () => {
        let results = '';
        let flag = true;
        this.state.UserSelecteds.map((item, index) => {
            let result = this.state.data.find(rocode => rocode.studentId == `${item}`)
            if (results == '') {
                results = result.regRegionId;
            }
            else if (results != result.regRegionId) {
                message.error('所选区域不同,不允许进行人员调整');
                flag = false;
            }
        });
        if (flag) {
            let params = { ids: this.state.UserSelecteds, results: results, type: 1 }
            this.onLookView("editmUser", params);
        }

    }
    oneditpUser = () => {
        let results = '';
        let flag = true;
        this.state.UserSelecteds.map((item, index) => {
            let result = this.state.data.find(rocode => rocode.studentId == `${item}`)
            if (results == '') {
                results = result.regRegionId;
            }
            else if (results != result.regRegionId) {
                message.error('所选区域不同,不允许进行人员调整');
                flag = false;
            }
        });
        if (flag) {
            let params = { ids: this.state.UserSelecteds, results: results, type: 2 }
            this.onLookView("editpUser", params);
        }

    }
    oneditfUser = () => {
        let results = '';
        let flag = true;
        this.state.UserSelecteds.map((item, index) => {
            let result = this.state.data.find(rocode => rocode.studentId == `${item}`)
            if (results == '') {
                results = result.regRegionId;
            }
            else if (results != result.regRegionId) {
                message.error('所选区域不同,不允许进行人员调整');
                flag = false;
            }
        });
        if (flag) {
            let params = { ids: this.state.UserSelecteds, results: results, type: 3 }
            this.onLookView("editfUser", params);
        }

    }
    editTeachCenter = () => {
        let params = { orderIds: this.state.UserSelecteds }
        this.onLookView("editTeachCenter", params)
    }

    onBatchEdit = () => {
        this.onLookView("EditBranch", { ids: this.state.UserSelecteds })
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
            case 'EditDate':
            case 'Edit':
            case 'editmUser':
            case 'editpUser':
            case 'editfUser':
            case 'editArea':
            case 'editTeachCenter':
                block_content = <View
                    viewCallback={this.onViewCallback}
                    {...this.state}

                />
                break;
            case 'EditBranch':
                block_content = <EditBranch
                    viewCallback={this.onViewCallback} {...this.state} 
                />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.showHideFN() }
                } icon={this.state.showHide?'caret-up':'caret-down'} className="button_dark" > 搜索条件{this.state.showHide?'收起':'展开'}</Button>);

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
                                        <FormItem {...searchFormItemLayout} label={'学生来源'} >
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
                                    <Col span={8} >
                                        <FormItem {...searchFormItemLayout} label="学生订单情况" >
                                            {getFieldDecorator('orderTypes', { initialValue: '' })(
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
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'区域'} >
                                            {getFieldDecorator('regRegionId', { initialValue: this.state.pagingSearch.regRegionId })(
                                                <SelectArea scope='my' hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'用户来源分部'}>
                                            {getFieldDecorator('sourceBranchId',{ initialValue:this.state.pagingSearch.sourceBranchId})(
                                                <Select
                                                    showSearch={true}
                                                    filterOption={(inputValue, option) => {  
                                                    var result = false;
                                                    for(var i = 0; i < option.props.children.length; i++){
                                                    if(option.props.children[i].indexOf(inputValue) != -1){
                                                        result = true;
                                                        break;
                                                    }
                                                    }
                                                    return result;
                                                    }}
                                                >
                                                    <Option value=''>全部</Option> 
                                                    {this.state.all_org_list.map((dqItem) => {
                                                        return <OptGroup label={dqItem.orgName}>
                                                            {dqItem.children.map((fbItem, index) => {
                                                            return <Option title={fbItem.state === 0?fbItem.orgName+'【停用】':fbItem.orgName} value={fbItem.orgId} key={index}>{fbItem.orgName}{fbItem.state === 0 ? '【停用】' : ''}</Option>
                                                            })}
                                                        </OptGroup>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {
                                        this.state.showHide && <div>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="目前情况"
                                        >
                                            {getFieldDecorator('isStudy', { initialValue: this.state.pagingSearch.isStudy })(
                                                <Select
                                                    onChange={(value) => {
                                                        if (value == 1) {
                                                            this.setState({
                                                                isStudy: true
                                                            })
                                                        } else {
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
                                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                                })}
                                                            </Select>
                                                        )}
                                                    </div>
                                                </FormItem>
                                            </Col>
                                            :
                                            ''
                                    }
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'微信'} >
                                            {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                                                <Input placeholder="请输入微信" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'QQ'} >
                                            {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                                                <Input placeholder="请输入QQ" />
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
                                            label="首次活动名称">
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
                                    {
                                        (!this.state.isStudy && this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) ? <Col span={8}></Col> : ''
                                    }
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
                                        (!this.state.isStudy && this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType != 2) ? <Col span={8}></Col> : ''
                                    }
                                    <Col span={8}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="创建日期">
                                            {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}></Col>
                                    <Col span={8}></Col>
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
                            rowSelection={rowSelection}
                            dataSource={this.state.data}//数据
                            onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: 2400 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={24}>
                                    
                                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                                        <Button onClick={this.onBatchEdit} icon="tool">调整分部</Button> :
                                        <Button disabled icon="tool">调整分部</Button>
                                    }
                                    <div className='split_button' style={{ width: 10 }}></div>
                                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                                        <Button onClick={this.oneditArea} icon='tool'>调整区域</Button> :
                                        <Button disabled icon='tool'>调整区域</Button>
                                    }
                                    <div className='split_button' style={{ width: 10 }}></div>
                                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                                        <Button onClick={this.oneditmUser} icon='tool'>调整市场人员</Button> :
                                        <Button disabled icon='tool'>调整市场人员</Button>
                                    }
                                    <div className='split_button' style={{ width: 10 }}></div>
                                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                                        <Button onClick={this.oneditpUser} icon='tool'>调整电咨人员</Button> :
                                        <Button disabled icon='tool'>调整电咨人员</Button>
                                    }
                                    <div className='split_button' style={{ width: 10 }}></div>
                                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                                        <Button onClick={this.oneditfUser} icon='tool'>调整面咨人员</Button> :
                                        <Button disabled icon='tool'>调整面咨人员</Button>
                                    }
                                    <div className='split_button' style={{ width: 10 }}></div>
                                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                                        <Button onClick={this.editTeachCenter} icon='tool'>调整教学点</Button> :
                                        <Button disabled icon='tool'>调整教学点</Button>
                                    }
                                    
                                </Col>

                            </Row>
                            <Row justify="end" align="right" type="flex">
                                <Col span={24} className={'search-paging-control'} align="right" fixed="right" style={{paddingTop:20}}>
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
const WrappedAscriptionManage = Form.create()(AscriptionManage);

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
        getFBAdjustBranchList: bindActionCreators(getFBAdjustBranchList, dispatch),
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
        editAdjustBranch: bindActionCreators(editAdjustBranch, dispatch),
        editAreaByAreaId: bindActionCreators(editAreaByAreaId, dispatch),
        editUser: bindActionCreators(editUser, dispatch),
        changeTeachCenter: bindActionCreators(changeTeachCenter, dispatch),
        //用户分部来源
        queryAllBranch: bindActionCreators(queryAllBranch, dispatch),
        //用户分部来源
        UserSourceDivision: bindActionCreators(UserSourceDivision, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAscriptionManage);
