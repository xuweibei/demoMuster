//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table,
    Pagination, Divider, Modal, Card,Popconfirm
} from 'antd';
import { env } from '@/api/env';
const FormItem = Form.Item;

import { getOrgUserList, addOrgUserInfo, getRoleList, saveUserRole } from '@/actions/admin';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
     onSearch, onPageIndexChange
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, transformListToTree } from '@/utils';

//业务接口方法引入
import {
    getLastDepthList, getOrgList, saveOrgInfo, deleteOrgInfo, setOrgAdminInfo,
    orgBranchListByParentId,modifyUser,deleteAdmin
} from '@/actions/admin';
import './modify.css'
import DropDownButton from '@/components/DropDownButton';

class OrgManage extends React.Component {

    constructor() {
        super()
        //扩展方法用于本组件实例
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        (this: any).getConditionData = this.getConditionData.bind(this);

        this.state = {
            currentDataModel: null,
            pagingSearch: {
                orgName: '',
                orgId: '',
                state: '',
                currentPage: 1,
                pageSize: env.defaultPageSize,
                totalRecord:1
                //sortField: '',
                //sortOrder: '',
            },
            data_list: [],
            loading: false,
            arr:[],
            UserSelecteds: [],
        };

    }
    componentWillUnMount() {
    }
    confirm(e,a) {
        e.userUsertypeId?this.delete(e):this.delete();
    }
      
    //table 输出列定义
    columns = [
        {
            title: '机构名称',
            width: 180,
            fixed: 'left',
            dataIndex: 'title',
            // render: text => <a href="javascript:;">{text}</a>,
        }, 
        {
            title: '角色',
            // width: 100,
            dataIndex: 'address',
            render:  (text, record) => {
                if(record.address==1){
                    return  <span>总部管理员</span>
                }else if(record.address==2){
                    return <span>大区管理员</span>
                }else{
                    return <span>分部管理员</span>
                }
          },
        }, 
        {
            title: '超级管理员',
            // width: 100,
            userUsertypeId:1,
            dataIndex: 'value',
            render:  (text, record) => {
                  if(record.value==1){
                    return <span>是</span>
                  }else{
                    return <span>否</span>
                  }
            },
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            key: 'action',
            render: (text, record) => (
                <DropDownButton>
                    <Button onClick={()=>{this.deleteAsk(record)}}>
                    删除
                    </Button>
                </DropDownButton >
            ),
        }
    ];
    deleteAsk=(record)=>{
        Modal.confirm({
            title: '是否删除?',
            content: '点击确认删除!否则点击取消！',
            onOk: () => {
                record?this.delete(record):this.delete();
            }
        })
    }
    componentWillReceiveProps(){
        
        this.getConditionData();
    }
    componentWillMount() {
        //首次进入搜索，加载服务端字典项内容
        this.getConditionData();
    }
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getOrgUserList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            // console.log(data)
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message, 3);
            }
            else {
                this.setState({ pagingSearch: condition, ...data, loading: false })
            }
        })
    }
    //获取条件列表
    getConditionData() {
        let arr = {};
        arr.currentPage = this.props.currentPage;
        arr.pageSize = this.props.pageSize;
        arr.userId = this.props.currentDataModel.userId;
        if(this.props.currentDataModel.token == null){
            this.setState({arr:[]})
        }
        // console.log(arr)
        this.props.modifyUser(arr).payload.promise.then((response) => {
            let data = response.payload.data;
            console.log(data)
            if (data.state === 'success') {
                var list = [];
               if(data.data){
                    data.data.map(a => {
                    list.push({ title: a.orgName, value: a.isAdmin,address:a.usertype,userUsertypeId:a.userUsertypeId});
                        
                    });
                    let Pagination = this.state.pagingSearch;
                    Pagination.totalRecord = data.data.length;
                    this.setState({
                        Pagination
                    })
                    this.setState({ data_list: list })
                }else{
                    this.setState({ data_list: [] })
                }
            }
            else {
                message.error(data.message);
            }
        })
    };
    //删除成功之后的回调
    onCancel = () => {
        this.props.viewCallback();
    }
    //批量删除
    delete = (deleteUse) =>{
        console.log(this.state.arr)
        let userTypeIds = '';
        //这里是判断是单选还是全选，单选传参，全选不传参
        if(deleteUse){
            userTypeIds = deleteUse.userUsertypeId;
        }else{
            if(this.state.arr.length<1){
                message.warning('未选中任何数据');
                return;
            }
            //this.state.arr储存的是选中的那个id
            userTypeIds = this.state.arr.join(',');
        }
        let obj = {
            userTypeIds
        }
        this.props.deleteAdmin(obj).payload.promise.then((response) => {
            let data = response.payload.data;
            if(data.state=='success'){
              message.success('删除成功');
              this.props.viewCallback('modify');
            }else{
              message.error(data.message);
            }
        })
    }
    render() {
        console.log(this.props)
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
                let a = this.state.arr;
                 a = [];
                if(selectedRows[0]){
                    selectedRows.forEach(e=>{
                        a.push(e.userUsertypeId)
                    })
                    this.setState({
                        arr:a
                    })
                    
                }
            },
          };
        return  (
                    <div>
                        {/* 内容分割线 */}
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                rowSelection={rowSelection}
                                dataSource={this.state.data_list}//数据
                                //onChange={this.handleTableChange}
                                onExpand={this.rowOnExpand}
                                bordered
                                //rowSelection={rowSelection}
                            />
                           <div className='Roperation'>
                                <FormItem
                                    className='RoperationDelete'
                                >
                                {
                                    this.state.UserSelecteds.length > 0 ? <Button onClick={()=>{this.deleteAsk()}} icon="delete">
                                        批量删除
                                    </Button>
                                    :
                                    <Button disabled onClick={()=>{this.deleteAsk()}} icon="delete">
                                        批量删除
                                    </Button>
                                }
                                
                                </FormItem>
                                <FormItem
                                    className='RoperationBack'
                                >
                                    <Button onClick={this.onCancel} icon="rollback">返回</Button>
                                </FormItem>
                           </div>
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={6}>
                                    </Col>
                                    <Col span={18} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={1}
                                            defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                            defaultPageSize = {10}
                                            pageSize={this.state.pagingSearch.pageSize}
                                            onChange={this.onPageIndexChange}
                                            showTotal={(total) => { return `共${total}条数据`; }}
                                            total={this.state.pagingSearch.totalRecord}
                                             />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
        )
    }
}
//表单组件 封装
const WrappedManage = Form.create()(OrgManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //各业务接口
        modifyUser:bindActionCreators(modifyUser, dispatch),
        getOrgUserList: bindActionCreators(getOrgUserList, dispatch),
        deleteAdmin:bindActionCreators(deleteAdmin, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
