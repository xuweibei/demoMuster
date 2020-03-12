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
import { getAreaByBranchList, editAreaByBranch, addAreaByBranch, addUserByAreaId,updQuyuOfUser,qryQuyuOfUser} from '@/actions/base';
//业务数据视图（增、删、改、查)
import OrganizationAreaView from '../OrganizationAreaView';
import DropDownButton from '@/components/DropDownButton';
import ContentBox from '@/components/ContentBox';



class AdminUserAreaManage extends React.Component {

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
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 1000,
                orgName: '',
                userIds:'',
                quyuIds:'',
                state: 1,
            },

            data: [],
            UserSelecteds: [],
            totalRecord: 0,
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
        if(this.props.editMode=='EditArea'){
            this.fetchUserAreaList(this.props.currentDataModel.userIds);
        }
    }
   


    //table 输出列定义
    columns = [
        {
            title: '区域名称',
            width: 220,
            fixed: 'left',
            dataIndex: 'orgName'
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.state);
            }
        },
        {
            title: '地址',
            dataIndex: 'address',
        },

        {
            title: '负责人',
            dataIndex: 'chargeMan',
        },
        {
            title: '移动电话',
            dataIndex: 'mobile',
            width: 120,
            fixed: 'right',
        },
    ];


 //检索数据
  //检索用户负责的分区列表数据
  fetchUserAreaList = (userId) => {
    let condition = { currentPage: 1, pageSize: 999, userId: userId };
    this.props.qryQuyuOfUser(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        let d = [];
        if (data.result === false) {
            message.error(data.message);
        }
        else {
            let orgList = [];
            data.data.map((a) => {
                orgList.push(a.orgId);
            })
            console.log(orgList);
            this.setState({
                UserSelecteds: orgList,
            })

        }
    })
}

    //检索数据
    fetch = (params = {}) => {
        console.log(this.props);
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.getAreaByBranchList(condition).payload.promise.then((response) => {
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

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    onSave = () => {    
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
          if (!err) {
            this.setState({ loading: true });
            setTimeout(() => {
              this.setState({ loading: false });
            }, 3000);//合并保存数据
            console.log(this.state.UserSelecteds)
            if (this.props.editMode == 'EditArea') {
              var postData = {
                userIds: this.props.currentDataModel.userIds,
                quyuIds:this.state.UserSelecteds.join(','),
              }
            }
            else {
              var postData = {
                userIds: this.props.currentDataModel.userIds.join(','),
                quyuIds:this.state.UserSelecteds.join(','),
              }
            }
            this.props.viewCallback({ ...values, ...postData, });//合并保存数据
          }
        });
      }
  
    onCancel = () => {
        this.props.viewCallback();
    }
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Delete":
                    break;
                case "AddArea":
                    this.props.addAreaByBranch(dataModel).payload.promise.then((response) => {
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
                case "EditArea":
                    this.props.updQuyuOfUser(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("EditArea", null);
                        }
                    })
                    break;
                     case "EditAreapl":
                    this.props.updQuyuOfUser(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.result === false) {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("EditArea", null);
                        }
                    })
                    break;
            }
        }
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>

        switch (this.state.editMode) {

            default:
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

                    {/* 内容分割线 */}
                    <div className="space-default"></div>
                    {/* 数据表格 */}
                    <div className="search-result-list">
                        <Table columns={this.columns} //列定义
                            loading={this.state.loading}
                            rowSelection={rowSelection}
                            rowKey={'orgId'}
                            pagination={false}
                            dataSource={this.state.data}//数据
                            bordered
                            scroll={{ x: 1300 }}
                        />
                        <div className="space-default"></div>
                        <div className="search-paging">
                            <Row justify="end" align="middle" type="flex">
                                
                            </Row>
                            <div className="space-default"></div>
                            <Row justify="center" align="middle" type="flex">
                           {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                            <Button onClick={this.onSave} icon='enter'>确定</Button> :
                            <Button disabled icon='onSave'>确定</Button>
                           }
                            <div className="split_button"></div>
                                <Button onClick={this.onCancel} icon="rollback">返回</Button>
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
const WrappedAdminUserAreaManage = Form.create()(AdminUserAreaManage);

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
        getAreaByBranchList: bindActionCreators(getAreaByBranchList, dispatch),
        addAreaByBranch: bindActionCreators(addAreaByBranch, dispatch),
        editAreaByBranch: bindActionCreators(editAreaByBranch, dispatch),
        addUserByAreaId: bindActionCreators(addUserByAreaId, dispatch),
        updQuyuOfUser:bindActionCreators(updQuyuOfUser, dispatch),
        qryQuyuOfUser:bindActionCreators(qryQuyuOfUser, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserAreaManage);
