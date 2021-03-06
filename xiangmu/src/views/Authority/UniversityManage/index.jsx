//标准组件环境
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { universityList, universityAddOrEdit } from '@/actions/admin';
//业务数据视图（增、删、改、查)
import UniversityView from '../UniversityView';
import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
import AreasSelect from '@/components/AreasSelect';

class UniversityManage extends React.Component {

    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                state: '',
                universityLevel: '',
                leadFlag:''
            },
            data: [],
            totalRecord: 0,
            loading: false
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary([ 'dic_YesNo','dic_Status', 'university_level']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [{
        title: '高校名称',
        width: 200,//可预知的数据长度，请设定固定宽度
        dataIndex: 'universityName',
        fixed: 'left',
    },
    {
        title: '高校编码',
        dataIndex: 'universityCode',
    },
    {
        title: '领航校区',
        dataIndex: 'leadFlag',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_YesNo, record.leadFlag);
        }
    },
    {
        title: '所属分部',
        dataIndex: 'branchName',
    },
    {
        title: '高校级别',
        width: 120,
        dataIndex: 'universityLevel',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.university_level, record.universityLevel);
        }
    },
    {
        title: '区域',
        dataIndex: 'areaName',
    },
    {
        title: '状态',
        width: 80,
        dataIndex: 'state',
        render: (text, record, index) => {
            return getDictionaryTitle(this.state.dic_Status, record.state);
        }
    },
    {
        title: '操作',
        width: 120,//可预知的数据长度，请设定固定宽度
        key: 'action',
        fixed: 'right',
        render: (text, record) => {
            return <DropDownButton>
                <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                {/*<Button onClick={() => { this.onLookView('Delete', record) }}>删除</Button>*/}
            </DropDownButton>
        }
    }];


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        if (condition.areaId) {
            condition.areaId = condition.areaId[condition.areaId.length - 1];
        }
        this.props.universityList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
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
            this.state.pagingSearch.areaId = '';
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                case "Edit":
                    this.props.universityAddOrEdit(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message, 3);
                        }
                        else {
                            if(this.state.editMode == 'Create'){
                                message.success("高校添加成功！")
                            }else{
                                message.success("高校修改成功！")
                            }
                            
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
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
                block_content = <UniversityView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                //除查询外，其他扩展按钮数组
                let extendButtons = [];
                extendButtons.push(<Button onClick={() => { this.onLookView('Create', { isAdmin: 0, state: 1, roleName: '', description: '' }) }} icon="plus" className="button_dark">高校</Button>);
                block_content = (<div>
                    {/* 搜索表单 */}
                    <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&
                            <Form
                                className="search-form"
                            >
                                <Row justify="center" gutter={24} align="middle" type="flex">
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="高校名称"
                                        >
                                            {getFieldDecorator('universityName', { initialValue: this.state.pagingSearch.universityName })(
                                                <Input placeholder="请输入高校名称" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="高校编码"
                                        >
                                            {getFieldDecorator('universityCode', { initialValue: this.state.pagingSearch.universityCode })(
                                                <Input placeholder="请输入高校编码" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="高校级别"
                                        >
                                            {getFieldDecorator('universityLevel', { initialValue: this.state.pagingSearch.universityLevel })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.university_level.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="区域"
                                        >
                                            {getFieldDecorator('areaId', { initialValue: this.state.pagingSearch.areaId })(
                                               <AreasSelect
                                                  value={this.state.pagingSearch.areaId}
                                                  areaName={this.state.pagingSearch.areaName}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_Status.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="领航校区"
                                        >
                                            {getFieldDecorator('leadFlag', { initialValue: this.state.pagingSearch.leadFlag })(
                                                <Select>
                                                    <Option value="">全部</Option>
                                                    {this.state.dic_YesNo.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
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
                            dataSource={this.state.data}//数据
                            //onChange={this.handleTableChange}
                            bordered
                            scroll={{ x: this.columns.length > 7 ? 1300 : 0 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                <Col span={24} className='search-paging-control'>
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
const WrappedUniversityManage = Form.create()(UniversityManage);

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
        universityList: bindActionCreators(universityList, dispatch),
        universityAddOrEdit: bindActionCreators(universityAddOrEdit, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUniversityManage);
