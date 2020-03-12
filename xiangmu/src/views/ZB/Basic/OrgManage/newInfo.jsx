//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table,
    Pagination, Divider, Modal, Card
} from 'antd';
import { env } from '@/api/env'; 
const confirm = Modal.confirm;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, 
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, transformListToTree } from '@/utils';

//业务接口方法引入
import {
    getLastDepthList, SuperAdministratorPageList, SuperAdministratorPageDelete, deleteOrgInfo, setOrgAdminInfo,
    orgBranchListByParentId
} from '@/actions/admin'; 
import SuperAdminSetting from './superAdminSetting';
const model = {
    orgId: '',
    parentOrgid: null,
    orgName: '',
    orgCode: '',
    chargeMan: '',
    orgType: '2',
    state: '1',
    mobile: '',
    email: '',
    address: '',
    zipcode: '',
    contactPhone: '',
    faxPhone: '',
    orderNo: 0,
    areaCode: ''
};

class OrgManage extends React.Component {

    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this); 

        this.state = {
            currentDataModel: null,
            editMode: props.editMode,//Edit,Create,View,Delete
            pagingSearch: {
                orgName: '',
                orgId: '',
                state: '',
                currentPage: 1,
                pageSize: env.defaultPageSize,
                //sortField: '',
                //sortOrder: '',
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            last_depth_list: [],
            UserSelecteds: [],
        };

    }
    componentWillMount() { 
        console.log(this.props)
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'dic_OrgType']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch(); 
    }
    componentWillUnMount() {
    }

    //table 输出列定义
    columns = [ 
        {
            title: '姓名',
            fixed: 'left',
            width: 120,//可预知的数据长度，请设定固定宽度
            dataIndex: 'realName',
        },
        {
            title: '工号',
            dataIndex: 'loginName',
        },
        {
            title: '操作',
            width: 120,//可预知的数据长度，请设定固定宽度
            fixed: 'right',
            key: 'action',
            render: (text, record) => (<Button onClick={()=>this.showConfirm(record)} icon="delete">删除</Button>
            ),
        }]; 
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.SuperAdministratorPageList({orgId:this.props.currentDataModel.orgId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') { 
                condition.currentPage = data.currentPage;
                this.setState({
                    pagingSearch: condition,
                    data_list: data.data,
                    totalRecord: data.totalRecord,
                    loading: false
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        })
    } 
    showConfirm = (value) => { 
        let that = this;
        confirm({
          title: '确定删除本条数据吗?',
          content: '',
          onOk() { 
            that.props.SuperAdministratorPageDelete({userUsertypeId:value.userUsertypeId}).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                    message.success("删除成功!")
                    that.onSearch();
                }else{
                    message.error(data.message);
                }
            })
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      }
    addInfo = () => {
        this.setState({
            editMode:'Info'
        })
    }
    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    onCancel = () => {
        this.props.viewCallback('search');
    }
    //视图回调
    onViewCallback = (dataModel) => { 
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: 'Manage' })
        }
        else {
            switch (this.state.editMode) {
                case "Create":
                break;
            }
        }
    } 
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "Info":
                block_content = <SuperAdminSetting viewCallbackS={this.onViewCallback} {...this.state} {...this.props} />
                break;  
            case "Manage":
            case 'Power':
            default: 
 
                block_content = (
                    <div> 
                        {/* 内容分割线 */}
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据 
                                bordered
                                scroll={{ x: 1100 }} 
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={24}> 
                                        <Button onClick={this.addInfo} icon="file-add">新增</Button> 
                                        <div className='split_button' style={{ width: 10 }}></div>
                                        <Button onClick={this.onCancel} icon="rollback">返回</Button> 
                                    </Col> 
                                </Row>
                            </div>
                        </div>
                    </div>
                );
                break;
        }
        return block_content;
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
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        SuperAdministratorPageList: bindActionCreators(SuperAdministratorPageList, dispatch), 
        //删除
        SuperAdministratorPageDelete: bindActionCreators(SuperAdministratorPageDelete, dispatch), 
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
