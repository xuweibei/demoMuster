//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider ,DatePicker} from 'antd';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, dataBind } from '@/utils';

//业务接口方法引入
import { getCampusByUniversityId,UserSourceDivision } from '@/actions/base';
import { getAscriptionList, editAdjustBranch } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import View from './View';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup'; 


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
            all_org_list:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                branchId: '',
                studyUniversityId: '',
                sourceBranchId:'',
                studyCampusId: '',
                realName: '',
                certificateNo: '',
                mobile: '',
                weixin:'',
                qq:'',
                createDateStart:'',
                createDateEnd:'',
            },
            UserSelecteds: [],
            data: [],
            dic_University: [],
            dic_Campus: [],
            totalRecord: 0,
            loading: false,
            startValue: null,
            endValue: null,
            universityArr: ''
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'sex', 'is_study']);
        //首次进入搜索，加载服务端字典项内容

        this.UserSource();
        // this.onSearch();
    }
    componentWillUnMount() { 
    }
    //用户来源分部
    UserSource = () => { 
      this.props.UserSourceDivision().payload.promise.then((response) => {
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

        if(condition.studyUniversityId && condition.studyUniversityId.length){
            this.setState({ universityArr: condition.studyUniversityId });
            condition.studyUniversityId = condition.studyUniversityId[0].id;
        }else{
            condition.studyUniversityId = '';
            this.setState({ universityArr: '' });
        }

        let createDateStart = condition.createDateStart;
        if(createDateStart){
            condition.createDateStart = createDateStart[0];
            condition.createDateEnd = createDateStart[1];
        }
        this.props.getAscriptionList(condition).payload.promise.then((response) => {
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
        title: '所属分部',
        fixed: 'left',
        width: 150,
        dataIndex: 'branchName',
    },
    {
      title: '用户来源分部',
      dataIndex: 'sourceBranchName'
    },
      {
        title: '所属区域',
        width: 150,
        dataIndex: 'regRegionName'
      },
    {
        title: '教学点',
        dataIndex: 'teachCenterName',
        render: (text, record, index) => {
            return <div>{text}</div>
        }
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
        width: 100,
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
        width: 80,
        dataIndex: 'studyUniversityEnterYear'
    },
    {
        title: '证件号',
        dataIndex: 'certificateNo'
    },
    {
        title: '手机',
        width: 120,
        dataIndex: 'mobile'
    },
    {
        title: '微信',
        width: 120,
        dataIndex: 'weixin'
    },
    {
        title: 'QQ',
        width: 120,
        dataIndex: 'qq'
    },
    {
        title: '邮箱',
        width: 120,
        dataIndex: 'email'
    },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        fixed: 'right',
        width: 100,
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
                          this.setState({ UserSelecteds: [] });
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    })
                    //提交
                    break;

            }
        }
    }

    onBatchEdit = () => {
        this.onLookView("Edit", { ids: this.state.UserSelecteds })
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
            case "Create":
            case "Edit":
            case "View":
            case "Delete":
                block_content = <View viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'分部'} >
                                            {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                                                <SelectFBOrg scope='my' hideAll={false} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="在读院校:"
                                        >
                                                {getFieldDecorator('studyUniversityId', {  initialValue:  !this.state.universityArr?[]:[{
                                                    id:this.state.universityArr[0].id,
                                                    name:this.state.universityArr[0].name
                                                }], })(
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
                                    <Col span={8}>
                                      <FormItem {...searchFormItemLayout} label={'校区:'} >
                                        {getFieldDecorator('studyCampusId', { initialValue: dataBind(this.state.pagingSearch.studyCampusId) })(
                                          <Select>
                                            <Option value=''>--请选择院校-- </Option>
                                            {this.state.dic_Campus.map((item, index) => {
                                              return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                          </Select>
                                        )}
                                      </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                            {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                                                <Input placeholder="请输入学生姓名" />
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
                                        <FormItem {...searchFormItemLayout} label={'手机号'} >
                                            {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                                                <Input placeholder="请输入手机号" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                      <FormItem {...searchFormItemLayout} label={'微信'} >
                                        {getFieldDecorator('weixin', { initialValue: this.state.pagingSearch.weixin })(
                                          <Input placeholder="请输入微信号" />
                                        )}
                                      </FormItem>
                                    </Col>
                                    <Col span={8}>
                                      <FormItem {...searchFormItemLayout} label={'QQ号'} >
                                        {getFieldDecorator('qq', { initialValue: this.state.pagingSearch.qq })(
                                          <Input placeholder="请输入QQ号" />
                                        )}
                                      </FormItem>
                                    </Col> 
                                    <Col span={8} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="创建日期">
                                            {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(
                                                <RangePicker style={{width:220}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                    </Col>
                                    <Col span={8}>
                                    </Col>
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
                            scroll={{ x: 1800 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="space-between" align="middle" type="flex">
                                <Col span={4}>
                                    {this.state.UserSelecteds.length > 0 ? <Button onClick={this.onBatchEdit} icon="tool">调整分部</Button> : <Button disabled icon="tool">调整分部</Button>}
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
const WrappedAscriptionManage = Form.create()(AscriptionManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getAscriptionList: bindActionCreators(getAscriptionList, dispatch),
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),
        editAdjustBranch: bindActionCreators(editAdjustBranch, dispatch),
        //用户分部来源
        UserSourceDivision: bindActionCreators(UserSourceDivision, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAscriptionManage);
