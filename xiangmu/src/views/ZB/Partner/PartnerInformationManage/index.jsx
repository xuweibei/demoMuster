//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    message, Form, Row, Col, Input, Select, Button, Icon, Table,
    Pagination, Divider, Modal, Card,
    Checkbox,
} from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
import {
    GetPartnerInfoList,LargeAreaDepartmentalDropDown
} from '@/actions/partner';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务数据视图（增、删、改、查)
import PartnerView from '../PartnerManage/view';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import SelectItem from '@/components/BizSelect/SelectItem';
import ContentBox from '@/components/ContentBox';
import SearchInput from '@/components/SearchInput';

const model = {
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

class PartnerInformationManage extends React.Component {
    select_timeout: null;
    select_current_value: '';


    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);

        this.state = {
            BranchArr:[],
            currentDataModel: null,
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                partnerName: '',  //大客户名称
                signState: '',    //签约情况
                recruitState: '', //招生状态
                partnerType: '',  //大客户类型
                itemIds: '',      //合作项目
                branchId: '',     //分部
                currentPage: 1,
                pageSize: 10,
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项: 招生状态，签约情况， 大客户类型， 项目合作方式
        this.loadBizDictionary(['dic_Status', 'signstate', 'partnertype', 'partner_class_type']);
        //首次进入搜索，加载服务端字典项内容
        // this.onSearch();
        this.GetBranchNew();
    }
    componentWillUnMount() {
    }
    GetBranchNew = (parentId) =>{
        let condition = {}; 
        condition.parentId = this.props.userType.orgId;
        this.props.LargeAreaDepartmentalDropDown(condition).payload.promise.then((response) => {
            let data = response.payload.data; 
                if(data.state == 'success'){
                  this.setState({
                    BranchArr:data.data
                  })
                }else{
                  message.error(data.msg);
                }
            }
        )
    }
    //table 输出列定义
    columns = [
        {
            title: '大客户名称',
            width: 200,//可预知的数据长度，请设定固定宽度
            dataIndex: 'partnerName',
            fixed: 'left',
            className: 'column-left',
        },
        {
            title: '所属分部',
            width:120,
            dataIndex: 'branchName',
        },

        {
            title: '签约情况',
            width: 100,
            dataIndex: 'signState',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.signstate, record.signState)
            }
        },
        {
            title: '招生状态',
            width: 100,
            dataIndex: 'recruitState',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.recruitState)
            }
        },
        {
            title: '类型',
            width:100,
            dataIndex: 'partnerType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.partnertype, record.partnerType)
            }
        },
        {
            title: '合作项目',
            dataIndex: 'itemNames',
        },
        {
            title: '合作方式',
            width: 120,
            dataIndex: 'partnerClassType',
            render: (text, record, index) => {
                return getDictionaryTitle(this.state.partner_class_type, record.partnerClassType)
            }
        },
        {
            title: '开发负责人',
            width:100,
            dataIndex: 'devChargeName',
        },
        {
            title: '创建人',
            width:100,
            dataIndex: 'createUName',
        },
        {
            title: '创建日期',
            width:100,  
            dataIndex: 'createDate',
            render: (text, record, index) => {
                return timestampToTime(record.createDate);
            }
        },
        {
            title: '操作',
            fixed: 'right',
            width: 120,
            render: (text, record) => (
                console.log(this.props)
                // <Button onClick={() => { this.onLookView('View', record) }}>查看</Button>
            ),
        }
    ];
    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        condition.partnerName = condition.partnerName && condition.partnerName.replace(/(^\s+)|(\s+$)/g,'');
        
        this.props.GetPartnerInfoList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                var list = [];
                data.data.map(a => {
                    a.key = a.partnerId;
                    list.push(a);
                });
                this.setState({
                    pagingSearch: condition,
                    data_list: list,
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
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case "View":
                block_content = <PartnerView viewCallback={this.onViewCallback} {...this.state} />
                break;
            case "Manage":
            default:
                const { getFieldDecorator } = this.props.form;
                let extendButtons = [];
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row gutter={24}>
                                        {/* {this.props.userType.usertype != 3 && <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="所属分部"

                                            >
                                                {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                                                    <SelectFBOrg scope={'my'} hideAll={false} />
                                                )}
                                            </FormItem>
                                        </Col>
                                        }  */}
                                        {
                                            this.props.userType.usertype == 2 &&<Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="分部">
                                            {getFieldDecorator('branchId', {
                                                initialValue: this.state.pagingSearch.branchId
                                            })(
                                                <Select>
                                                    <Option value=''>全部</Option>
                                                    {
                                                    this.state.BranchArr.map(item=>{
                                                        return <Option value={item.orgId}>{item.orgName}</Option>
                                                    })
                                                    }
                                                </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        }
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'大客户名称'} >
                                                {getFieldDecorator('partnerName', { initialValue: this.state.pagingSearch.partnerName })(
                                                    <Input placeholder="大客户名称" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="签约情况" >
                                                {getFieldDecorator('signState', { initialValue: this.state.pagingSearch.signState })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.signstate.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="招生状态" >
                                                {getFieldDecorator('recruitState', { initialValue: this.state.pagingSearch.recruitState })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.dic_Status.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        {this.props.userType.usertype != 3 && <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="大客户类型" >
                                                {getFieldDecorator('partnerType', { initialValue: this.state.pagingSearch.partnerType })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.partnertype.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        }
                                        <Col span={24}>
                                            <FormItem
                                                {...searchFormItemLayout24}
                                                style={{ paddingRight: 18 }}
                                                label={'合作项目'} >
                                                {getFieldDecorator('itemIds', { initialValue: this.state.pagingSearch.itemIds })(
                                                    <SelectItem scope='my' hideAll={false} showCheckBox={true} />
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>


                                </Form>
                            }
                        </ContentBox>
                        {/* 内容分割线 */}
                        <div className="space-default"></div>
                        <div className="search-result-list">
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.data_list}//数据
                                bordered
                                scroll={{ x: 1400 }}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={6}>

                                    </Col>
                                    <Col span={24} className={'search-paging-control'}>
                                        <Pagination showSizeChanger
                                            current={this.state.pagingSearch.currentPage}
                                            defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                            pageSize={this.state.pagingSearch.pageSize}
                                            onShowSizeChange={this.onShowSizeChange}
                                            onChange={this.onPageIndexChange}
                                            showTotal={(total) => { return `共${total}条数据`; }}
                                            total={this.state.totalRecord} />
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
const WrappedManage = Form.create()(PartnerInformationManage);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //return { Dictionarys };
    let { userType } = state.auth.currentUser;
    return { Dictionarys, userType };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //大客户列表
        GetPartnerInfoList: bindActionCreators(GetPartnerInfoList, dispatch),
        //大区分部下拉列表
        LargeAreaDepartmentalDropDown: bindActionCreators(LargeAreaDepartmentalDropDown, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
