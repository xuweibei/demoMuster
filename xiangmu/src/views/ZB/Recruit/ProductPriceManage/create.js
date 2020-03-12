/*
商品标准价格 列表
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, message, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Divider, InputNumber
} from 'antd';
const FormItem = Form.Item;

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
    loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
    searchFormItemLayout, searchFormItemLayout24,
    onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney } from '@/utils';

import { recruitProductPriceAddList, recruitProductPriceAddListSave } from '@/actions/recruit';

class ProductPriceCreate extends React.Component {
    constructor(props) {
        super(props);
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
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                recruitBatchId: props.recruitBatchId,
                productName: '',
                itemId: '',
                classTypeId: '',
                productType: '',
            },
            data: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
        };
    }
    componentWillMount() {
        //载入需要的字典项: 
        this.loadBizDictionary(['dic_Status', 'publish_state', 'producttype', 'teachmode']);
        //首次进入搜索
        this.onSearch();
    }
    componentWillUnMount() {
    }

    //班型	商品名称	商品属性	商品定价(¥)	已设分项总价(¥)	发布状态	操作
    columns = [
        {
            title: '班型',
            dataIndex: 'classTypeName',
        },
        {
            title: '商品名称',
            //自定义显示
            render: (text, record, index) => {
                return <div className='textleft'><a onClick={() => { this.onLookView('ProductView', record.product) }}>{record.product.productName}</a></div>
            }
        },
        {
            title: '商品属性',
            dataIndex: 'productTypeName'
        },
        {
            title: '授课方式',
            //自定义显示
            render: (text, record, index) => (`${getDictionaryTitle(this.state.teachmode, record.product.teachMode, '----')}`)
        },
        {
            title: '商品标价(¥)',
            //自定义显示
            render: (text, record, index) => (<InputNumber value={record.product.standardPrice} onChange={(value) => {
                if (isNaN(value) || value == '') {
                    record.product.standardPrice = 0;
                }
                else {
                    record.product.standardPrice = parseInt(value);
                }
                //更新价格
                this.setState({ data: this.state.data });
            }} />)
        }
    ];
    //检索数据
    fetch(params = {}) {
        //fixed查询时清除用户选择，尤其是涉及翻页
        this.setState({ UserSelecteds: [] });
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        this.props.recruitProductPriceAddList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    ...data,
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

    onBatchSave = () => {
        //商品价格数据准备
        var messages = [];
        let productPrices = this.state.UserSelecteds.map((key) => {
            var find = this.state.data.find((item) => { return item.product.productId == key });
            if (!find.product.standardPrice) {
                messages.push(`${find.product.productName}未设置商品标价`)
            }
            return {
                productId: key,
                productTotalPrice: find.product.standardPrice
            }
        });
        if (messages.length > 0) {
            message.warn(messages.join(';'))
            return;
        }
        Modal.confirm({
            title: '是否保存所选商品吗?',
            content: '请确认',
            onOk: () => {
                this.props.recruitProductPriceAddListSave(this.state.pagingSearch.recruitBatchId, productPrices).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        //fixed查询时清除用户选择，尤其是涉及翻页
                        this.setState({ UserSelecteds: [] });
                        this.setState({ hasAdd: true });
                        this.onCancel();//有添加强制刷新
                        // Modal.confirm({
                        //     title: '批量保存成功！您是否还想留在此页继续操作?',
                        //     content: '请确认',
                        //     okText: '继续',
                        //     cancelText: '取消',
                        //     onOk: () => {
                        //         this.setState({ UserSelecteds: [] })
                        //         this.onSearch();
                        //     },
                        //     onCancel: () => {
                        //         this.onCancel()//有添加强制刷新
                        //     }
                        // });
                    }
                });
            },
            onCancel: () => {
                console.log('Cancel');
            },
        });
    }
    onCancel = () => {
        this.props.viewCallback(this.state.hasAdd ? {} : null);//决定是否返回时刷新
    }
    render() {
        let block_content = <div></div>
        switch (this.state.editMode) {
            case 'ProductView':
                block_content = <ProductView
                    viewCallback={this.onViewCallback}
                    editMode={'View'}
                    currentDataModel={{ productId: this.state.currentDataModel.productId, productType: this.state.currentDataModel.productType }} />
                break;
            case 'Manage':
            default:
                var rowSelection = {
                    selectedRowKeys: this.state.UserSelecteds,
                    onChange: (selectedRowKeys, selectedRows) => {
                        //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                        this.setState({ UserSelecteds: selectedRowKeys })
                    },
                    getCheckboxProps: record => ({
                        disabled: false//!record.product.standardPrice, // Column configuration not to be checked            
                    }),
                }
                const { getFieldDecorator } = this.props.form;
                let extendButtons = [];
                extendButtons.push(<Button onClick={this.onCancel} icon="rollback" className="button_dark">返回</Button>);
                block_content = (
                    <div>
                        {/* 搜索表单 */}
                        <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                            {!this.state.seachOptionsCollapsed &&
                                <Form className="search-form" >
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="项目" >
                                                {getFieldDecorator('itemId', { initialValue: '' })(
                                                    <SelectItem scope='my' hideAll={false} />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="班型" >
                                                {getFieldDecorator('classTypeId', { initialValue: '' })(
                                                    <SelectClassType hideAll={false} />
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="商品属性" >
                                                {getFieldDecorator('productType', { initialValue: '' })(
                                                    <Select onChange={(value) => {
                                                        this.state.pagingSearch.productType = value;
                                                        this.state.pagingSearch.teachMode = '';
                                                        this.setState({ pagingSearch: this.state.pagingSearch })
                                                    }}>
                                                        <Option value="">全部</Option>
                                                        {this.state.producttype.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label={'商品名称'} >
                                                {getFieldDecorator('productName', { initialValue: this.state.pagingSearch.productName })(
                                                    <Input placeholder="商品名称" />
                                                )}
                                            </FormItem>
                                        </Col>
                                        {/* 课程商品时可以再筛选授课方式 */}
                                        {this.state.pagingSearch.productType == '2' && <Col span={12}>
                                            <FormItem
                                                {...searchFormItemLayout}
                                                label="授课方式"
                                            >
                                                {getFieldDecorator('teachMode', {
                                                    initialValue: '',
                                                    rules: [{
                                                        required: false, message: '请选择授课方式!',
                                                    }],
                                                })(
                                                    <Select>
                                                        <Option value="">全部</Option>
                                                        {this.state.teachmode.map((item, index) => {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        })}
                                                    </Select>
                                                    )}
                                            </FormItem>
                                        </Col>
                                        }
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
                                dataSource={this.state.data}//数据
                                rowKey={record => record.product.productId}//主键
                                bordered
                                rowSelection={rowSelection}
                            />
                            <div className="space-default"></div>
                            <div className="search-paging">
                                <Row justify="space-between" align="middle" type="flex">
                                    <Col span={10}>
                                        <div className='flex-row'>
                                            {(this.state.UserSelecteds.length > 0) ?
                                                <Button onClick={this.onBatchSave} icon={'save'} >批量保存</Button> :
                                                <Button disabled>批量保存</Button>
                                            }
                                        </div>
                                    </Col>
                                    <Col span={14} className={'search-paging-control'}>
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
const WrappedManage = Form.create()(ProductPriceCreate);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        recruitProductPriceAddList: bindActionCreators(recruitProductPriceAddList, dispatch),
        recruitProductPriceAddListSave: bindActionCreators(recruitProductPriceAddListSave, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
