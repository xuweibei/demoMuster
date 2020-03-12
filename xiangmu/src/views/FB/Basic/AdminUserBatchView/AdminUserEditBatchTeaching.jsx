//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getNotTeacheringByUser,BatchSettingTeacheringByUser } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';



class AdminUserBatchView extends React.Component {


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
            dataModel: props.currentDataModel,//数据模型
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                teachCenterName:'',
                userId: props.currentDataModel.userIds.join(','),

            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: []
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


    //table 输出列定义
    columns = [
        {
            title: '教学点名称',
            dataIndex: 'teachCenterName',
        },
        {
            title: '教学点类型',
            dataIndex: 'teachCenterType', 
            render:(text,record,idnex)=>{
                return record.teachCenterType==1?'高校':record.teachCenterType==2?'非高校':''
            }
        },

        {
            title: '校区名称',
            dataIndex: 'campusName'
        },
        {
            title: '高校名称',
            dataIndex: 'universityName'
        },
    ];


    onSave = () => { 
        let condition = {};
        condition.userIds = this.state.pagingSearch.userId;
        condition.scopeIds = this.state.UserSelecteds.join(',');
        this.props.BatchSettingTeacheringByUser(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state == 'success'){
                message.success('编辑成功！')
                this.props.viewCallback(true);
            }else{
                message.error(data.msg)
            }
         }
        ) 
    }
    onCancel = () => {
        this.props.viewCallback({ ...this.state.pagingSearch.userId,...this.props.currentDataModel.dataModel });//合并保存数据
    }

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch; 
        this.props.getNotTeacheringByUser(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                var list = data.data;
                this.setState({
                    data_list: list,
                    totalRecord: data.totalRecord,
                    loading: false
                })

            }
        })
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };
        block_content = (<div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                {!this.state.seachOptionsCollapsed &&
                    <Form
                        className="search-form"
                    >
                        <Row justify="center" gutter={24} align="middle" type="flex">

                            <Col span={16} pull={2}>
                                <FormItem {...searchFormItemLayout} label={'教学点名称'} >
                                    {getFieldDecorator('teachCenterName', { initialValue: this.state.pagingSearch.teachCenterName })(
                                        <Input placeholder="请输入教学点名称" />
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
                    rowKey={'orgId'}
                    rowSelection={rowSelection}
                    pagination={false}
                    dataSource={this.state.data_list}//数据
                    bordered
                />
                <div className="space-default"></div>
                <div className="search-paging">
                    <Row justify="flex-end" align="middle" type="flex">
                        <Col span={24} className='search-paging-control'>
                            <Pagination showSizeChanger
                                current={this.state.pagingSearch.currentPage}
                                defaultPageSize={this.state.pagingSearch.pageSize}      
                                pageSizeOptions = {['10','20','30','50','100','200']}
                                onShowSizeChange={this.onShowSizeChange}
                                onChange={this.onPageIndexChange}
                                showTotal={(total) => { return `共${total}条数据`; }}
                                total={this.state.totalRecord} />
                        </Col>
                    </Row>
                    <div className="space-default"></div>
                    <Row justify="center" align="middle" type="flex">
                        {
                            this.state.UserSelecteds.length?<Button onClick={this.onSave} icon="save">确定</Button>:<Button disabled icon="save">确定</Button>
                        }
                        <div className="split_button"></div>
                        <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Row>
                </div>
            </div>
        </div>);


        return block_content;
    }
}
//表单组件 封装
const WrappedAdminUserBatchView = Form.create()(AdminUserBatchView);

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
        getNotTeacheringByUser: bindActionCreators(getNotTeacheringByUser, dispatch),
        //设置
        BatchSettingTeacheringByUser: bindActionCreators(BatchSettingTeacheringByUser, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserBatchView);
