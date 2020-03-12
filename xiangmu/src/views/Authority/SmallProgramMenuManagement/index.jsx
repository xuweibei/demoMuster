//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Tabs, Modal } from 'antd';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { SmallProgramMenuList, SmallProgramMenuAdd, SmallProgramMenuEdit, SmallProgramMenuDelete } from '@/actions/admin';

import ContentBox from '@/components/ContentBox';
//业务数据视图（增、删、改、查)
import HomeView from './view.jsx';
import DropDownButton from '@/components/DropDownButton';

class HomeManage extends React.Component {

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
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 999,
                moduleType: '1'
            },
            data: [],
            totalRecord: 0,
            loading: false
        };

    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        this.props.SmallProgramMenuList(this.state.pagingSearch).payload.promise.then((response) => {
            let data = response.payload.data; 
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                this.setState({ ...data, loading: false })
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
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                    this.props.SmallProgramMenuAdd(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message, 3);
                        }
                        else {
                            //进入管理页
                            this.onLookView("Manage", null);
                            this.onSearch();
                        }
                    })
                    //提交
                    break;
                case "Edit": //提交
                    this.props.SmallProgramMenuEdit(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state != 'success') {
                            message.error(data.message, 3);
                        }
                        else {
                            //进入管理页
                            this.onLookView("Manage", null);
                            this.onSearch();
                        }
                    })
                    //提交
                    break;
                
                
            }
        }
    }
    columns = [
        {
            title: '功能模块名称',
            dataIndex: 'moduleName',
            width: 180,
            fixed: 'left',
        },
        {
            title: '模块归属',
            dataIndex: 'moduleType',
            render: (text, record, index) => {
                if(record.moduleType == 1){
                    return '总部'
                }else if(record.moduleType == 2){
                    return '大区'
                }else if(record.moduleType == 3){
                    return '分部'
                }
            }
        },
        {
            title: '功能模块编码',
            dataIndex: 'moduleCode',
        },
        {
            title: '显示顺序',
            dataIndex: 'orderNo',
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.state);
            }
        },
        {
            title: '创建日期',
            render: (text, record, index) => {
                return timestampToTime(record.createDate, false);
            }
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            key: 'action',
            fixed: 'right',
            render: (text, record) => (
                <DropDownButton>
                    <Button onClick={() => { this.onLookView('Edit', record) }}>编辑</Button>
                    <Button onClick={() => { this.onDeltet(record.smallProgramModuleId) }}>删除</Button>
                </DropDownButton>
            ),
        }]

    onDeltet = (moduleId) => {
        Modal.confirm({
            title: '是否删除所选模块?',
            content: '点击确认删除所选模块!否则点击取消！',
            onOk: () => {
                let params = { moduleId: moduleId }
                this.props.SmallProgramMenuDelete(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.onSearch();
                    }
                })
            }
        })
    };
    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {
            case "Create":
            case "Edit":
            case "View":
            // case "Delete":
                block_content = <HomeView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                
                let extendButtons = [];

                //顺序号    
                let nextOrderNo = this.state.data.length + 1;
                
                extendButtons.push(<Button onClick={() => { this.onLookView('Create',{ orderNo: nextOrderNo }) }} icon="plus" className="button_dark">模块</Button>);
                
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                        {!this.state.seachOptionsCollapsed &&  <Form className="search-form">
                              <Row justify="center" gutter={24} align="middle" type="flex">
                                <Col span={12}>
                                  <FormItem {...searchFormItemLayout} label={'模块类型'} >
                                    {getFieldDecorator('moduleType', { initialValue: this.state.pagingSearch.moduleType })(
                                      <Select onChange={(value) => {
                                            var pagingSearch = this.state.pagingSearch;
                                            pagingSearch.moduleType = value;
                                            
                                            this.setState({ pagingSearch: pagingSearch });

                                            // this.onSearch();
                                        }}>
                                          <Option value='1' key='1'>总部</Option>
                                          <Option value='2' key='2'>大区</Option>
                                          <Option value='3' key='3'>分部</Option>
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
                                bordered
                                scroll={{ x: 1000 }}
                            />
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
    }
}
//表单组件 封装
const WrappedHomeManage = Form.create()(HomeManage);

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
        SmallProgramMenuList: bindActionCreators(SmallProgramMenuList, dispatch),
        SmallProgramMenuAdd: bindActionCreators(SmallProgramMenuAdd, dispatch),
        SmallProgramMenuEdit: bindActionCreators(SmallProgramMenuEdit, dispatch),
        SmallProgramMenuDelete: bindActionCreators(SmallProgramMenuDelete, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedHomeManage);
